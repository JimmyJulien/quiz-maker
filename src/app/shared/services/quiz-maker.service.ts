import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, finalize, map, mergeMap, of, retry, tap, throwError } from 'rxjs';
import { ROUTE_PATHS } from 'src/app/app.routes';
import { ApiQuestionModel } from 'src/app/shared/models/api-question.model';
import { QuizAnswerModel } from '../models/quiz-answer.model';
import { QuizCategoryModel } from '../models/quiz-category.model';
import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizLineModel } from '../models/quiz-line.model';
import { QuizCategoryService } from './quiz-category.service';
import { QuizMakerStateService } from './quiz-maker-state.service';
import { QuizQuestionService } from './quiz-question.service';

/** Service handling the quiz maker state and actions */
@Injectable({
  providedIn: 'root'
})
export class QuizMakerService {

  readonly #stateService = inject(QuizMakerStateService);
  readonly #categoryService = inject(QuizCategoryService);
  readonly #questionService = inject(QuizQuestionService);
  readonly #router = inject(Router);

  getQuizLines(): Signal<QuizLineModel[]> {
    return this.#stateService.get('quizLines') as Signal<QuizLineModel[]>;
  }

  areQuizLinesLoading(): Signal<boolean> {
    return this.#stateService.get('areQuizLinesLoading') as Signal<boolean>;
  }

  isQuizMakerKo(): Signal<boolean> {
    return this.#stateService.get('isQuizMakerKo') as Signal<boolean>;
  }

  getQuizCategories(): Signal<QuizCategoryModel[]> {
    return this.#stateService.get('quizCategories') as Signal<QuizCategoryModel[]>;
  }

  areQuizCategoriesLoading(): Signal<boolean> {
    return this.#stateService.get('areQuizCategoriesLoading') as Signal<boolean>;
  }

  getSelectedQuizCategory(): Signal<string | null> {
    return this.#stateService.get('selectedQuizCategory') as Signal<string | null>;
  }

  getQuizDifficulties(): Signal<QuizDifficultyModel[]> {
    return this.#stateService.get('quizDifficulties') as Signal<QuizDifficultyModel[]>;
  }

  getQuizConfig(): Signal<QuizConfigModel | null> {
    return this.#stateService.get('quizConfig') as Signal<QuizConfigModel | null>;
  }

  canQuestionBeChanged(): Signal<boolean> {
    return this.#stateService.get('canQuestionBeChanged') as Signal<boolean>;
  }

  getQuizSubcategories(): Signal<string[]> {
    return computed(() => {
      const quizCategories = this.getQuizCategories();
      const categories = quizCategories();

      const selectedQuizCategory = this.getSelectedQuizCategory();
      const selectedCategory = selectedQuizCategory();
  
      // If no category, no subcategory
      if(categories.length === 0) return [];
  
      // Else filter on selected category and get only distinct subcategory name
      const nonDistinctSubcategories = categories
        .filter(category => category.subcategory && category.name === selectedCategory)
        .map(category => category.subcategory!);
  
      // Return distinct subcategories
      return [...new Set(nonDistinctSubcategories)];
    });
  }

  isQuizComplete(): Signal<boolean> {
    return computed(() => {
      const quizLines = this.getQuizLines();
      return quizLines().every(quizLine => !!quizLine.userAnswer);
    })
  }

  /**
   * Initialize the quiz categories
   * @returns the quiz categories
   */
  initializeQuizCategories(): Observable<QuizCategoryModel[]> {
    const quizCategories = this.getQuizCategories();
    if(quizCategories().length > 0) {
      return of(quizCategories());
    }

    // Start categories loading
    this.#stateService.set('areQuizCategoriesLoading', true);

    return this.#categoryService.getQuizCategories()
    .pipe(
      // Initialize quiz categories
      tap(categories => {
        this.#stateService.set('quizCategories', categories);
      }),
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
        this.#handleQuizError('Error retrieving categories', error)
      ),
      // Stop categories loading even if an error occurs
      finalize(() => {
        this.#stateService.set('areQuizCategoriesLoading', false);
      })
    );
  }

  /**
   * Reload the quiz
   */
  reloadQuiz(): void {
    // Reset quiz maker ko indicator
    this.#stateService.reset('isQuizMakerKo');

    // Redirect to quiz page
    this.#router.navigate(['']);
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.#stateService.set('selectedQuizCategory', category);
  }

  /**
   * Create quiz lines from a quiz configuration
   * @param quizConfig the quiz configuration
   * @returns the quiz lines
   */
  createQuizLines(quizConfig: QuizConfigModel | null): Observable<QuizLineModel[]> {    
    // If no config, return empty quiz
    if(!quizConfig) {
      return of([]);
    }

    // Start quiz lines loading
    this.#stateService.set('areQuizLinesLoading', true);

    // Get quiz category
    const quizCategory = this.#getQuizCategory(quizConfig);

    // Save config in a signal (used for question change)
    this.#stateService.set('quizConfig', quizConfig);

    // Get questions from category id and config difficulty
    return this.#questionService.getApiQuestions(quizCategory.id, quizConfig.difficulty!)
      .pipe(
        map(apiQuestions => {
          const quizLines = apiQuestions.map(apiQuestion => this.#createQuizLineFromApiQuestion(apiQuestion));
          this.#stateService.set('quizLines', quizLines);
          this.#router.navigate([`/${ROUTE_PATHS.QUIZ}`]);
          return quizLines;
        }),
        // Handle error while creating quiz lines
        catchError((error: HttpErrorResponse) => {
          return this.#handleQuizError('Error creating quiz lines', error)
        }),
        // Stop quiz lines loading even if an error occurs
        finalize(() => {
          this.#stateService.set('areQuizLinesLoading', false);
        })
      );
  }

  /**
   * Update quiz state and complete indicator with a quiz answer
   * @param quizAnswer the quiz answer
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.#updateQuizState(quizAnswer);
  }

  /**
   * Change the quiz line passed as a parameter
   * @param quizLineToChange the quiz line to change
   * @returns the new question
   */
  changeQuizLine(quizLineToChange: QuizLineModel): Observable<ApiQuestionModel> {
    // Get last config category and difficulty
    const actualQuizConfig = this.getQuizConfig();
    const configCategory = actualQuizConfig()?.category;
    const configDifficulty = actualQuizConfig()?.difficulty;
    const categories = this.getQuizCategories();

    // If no category, no difficulty or no categories, stop stream
    if(!configCategory || !configDifficulty || !categories()) {
      return EMPTY;
    }

    // Get quiz category
    const quizCategory = this.#getQuizCategory(actualQuizConfig());

    // Indicate that quiz lines are loading
    this.#stateService.set('areQuizLinesLoading', true);

    // Get a new api question
    return this.#getNewApiQuestion(quizCategory.id, configDifficulty)
    .pipe(
      tap(newApiQuestion => {
        // Replace quiz line
        this.#replaceQuizLine(quizLineToChange, newApiQuestion);

        // Question can not be changed twice
        this.#stateService.set('canQuestionBeChanged', false);
      }),
      finalize(() => {
        this.#stateService.set('areQuizLinesLoading', false);
      })
    );
  }
  
  /**
   * Show quiz results
   */
  showQuizResults(): void {
    this.#router.navigate([`/${ROUTE_PATHS.RESULT}`]);
  }

  /**
   * Reset the quiz and navigate to the quiz page
   */
  createNewQuiz(): void {
    this.#resetQuiz();
    this.#router.navigate([`/${ROUTE_PATHS.HOME}`]);
  }

  /**
   * Handle a quiz error by logging the error and alerting the user
   * @param explicitErrorMessage the explicit error message to log 
   * @param error the original error to log
   * @returns an empty Observable that stop the stream
   */
  #handleQuizError(explicitErrorMessage: string, error: HttpErrorResponse): Observable<never> {
    // Update quiz maker ko indicator
    this.#stateService.set('isQuizMakerKo', true);
    
    // Log error in the browser console
    console.error(explicitErrorMessage, error);

    // return an empty Observable to stop the stream
    return EMPTY;
  }

  /**
   * Create a quiz line from a quiz question
   * @param apiQuestion the quiz question
   * @returns the quiz line
   */
  #createQuizLineFromApiQuestion(apiQuestion: ApiQuestionModel): QuizLineModel {
    return {
      question: apiQuestion.question,
      answers: this.#shuffleAnswers([...apiQuestion.incorrect_answers, apiQuestion.correct_answer]),// Randomize answers
      correctAnswer: apiQuestion.correct_answer,
      userAnswer: null,
    };
  }

  /**
   * Shuffle answers passed in parameters
   * @param answers the answers to shuffle
   * @returns the shuffled answers
   */
  #shuffleAnswers(answers: string[]): string[] {
    return answers
      .map(answer => ({ value: answer, sortValue: Math.random()}))
      .sort((answer1, answer2) => answer1.sortValue - answer2.sortValue)
      .map(({value}) => value);
  }

  /**
   * Update quiz state with a quiz answer
   * @param quizAnswer the quiz answer
   */
  #updateQuizState(quizAnswer: QuizAnswerModel): void {
    const actualQuizLines = this.getQuizLines();

    const newQuizLines = [...actualQuizLines()].map(quizLine => {
      if(quizLine.question === quizAnswer.question) {
        quizLine.userAnswer = quizAnswer.answer;
      }
      return quizLine;
    });

    this.#stateService.set('quizLines', newQuizLines);
  }

  /**
   * Reset the quiz
   */
  #resetQuiz(): void {
    // Empty quiz lines
    this.#stateService.reset('quizLines');

    // Quiz config is reset
    this.#stateService.reset('quizConfig');

    // No category is selected
    this.#stateService.reset('selectedQuizCategory');

    // Bonus question can be used again
    this.#stateService.reset('canQuestionBeChanged');
  }

  /**
   * Get a quiz category from the config passed as parameter
   * @param quizConfig he quiz config
   * @returns the quiz category
   */
  #getQuizCategory(quizConfig: QuizConfigModel | null): QuizCategoryModel {
    const quizCategories = this.getQuizCategories();
    
    // If no config or no categories, throw an error
    if(!quizConfig || quizCategories().length === 0) {
      throw new Error('No quiz config or quiz categories defined');
    }

    // Get quiz category
    const quizCategory = quizCategories().find(category => {
      const isSameCategory = category.name === quizConfig.category;
      
      if(quizConfig.subcategory) {
        const isSameSubcategory = category.subcategory === quizConfig.subcategory;
        return isSameCategory && isSameSubcategory;
      }

      return isSameCategory;
    });

    // If category doesn't exist, throw an error
    if(!quizCategory) {
      throw new Error(`Quiz category '${quizConfig.category}' doesn't exist`);
    }

    return quizCategory;
  }

  /**
   * Select a new api question (different from those of the actual quiz)
   * @param apiQuestions the api questions potentially containing the new question
   * @returns the new api question
   */
  #getNewApiQuestion(categoryId: number, difficulty: string): Observable<ApiQuestionModel> {
    return this.#questionService.getApiQuestions(categoryId, difficulty)
    .pipe(
      // Select new API questions
      mergeMap(apiQuestions => {
        // Get actual questions
        const actualQuizLines = this.getQuizLines();
        const actualQuestions = actualQuizLines().map(quizLine => quizLine.question);

        // Get only questions different from the actual ones
        const newApiQuestions = apiQuestions.filter(apiQuestion => !actualQuestions.includes(apiQuestion.question));

        // If no new question, throw error to launch retry
        if(newApiQuestions.length === 0) {
          return throwError(() => new Error('No new question found'));
        }

        // Else take first new api question
        return of(newApiQuestions[0]);
      }),
      // Retry 3 times
      retry(3),
      // If it's not enough, stop stream and show a notification
      catchError(() => {
        // TODO notification
        console.warn('No new question found');
        return EMPTY;
      })
    );
  }

  /**
   * Replace a line in the actual quiz lines
   * @param quizLineToChange le line to change
   * @param newApiQuestion the new question
   */
  #replaceQuizLine(quizLineToChange: QuizLineModel, newApiQuestion: ApiQuestionModel) {
    // Create new quiz line
    // Note: must look for a question until it's a different one from the others
    const newQuizLine = this.#createQuizLineFromApiQuestion(newApiQuestion);

    // Copy actual quiz lines and replace quiz line to change
    const actualQuizLines = this.getQuizLines();
    const newActualQuizLines = [...actualQuizLines()].map(quizLine => {
      return (quizLine.question === quizLineToChange.question) ? newQuizLine : quizLine;
    });

    // Update quiz lines
    this.#stateService.set('quizLines', newActualQuizLines);
  }

}
