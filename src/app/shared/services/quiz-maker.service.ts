import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, finalize, mergeMap, of, retry, tap, throwError } from 'rxjs';
import { ROUTE_PATHS } from 'src/app/app.routes';
import { ApiQuestionModel } from 'src/app/shared/models/api-question.model';
import { QuizAnswerModel } from '../models/quiz-answer.model';
import { QuizCategoryModel } from '../models/quiz-category.model';
import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizLineModel } from '../models/quiz-line.model';
import { QuizMakerUtils } from '../utils/quiz-maker.utils';
import { QuizCategoryService } from './quiz-category.service';
import { QuizDifficultyService } from './quiz-difficulty.service';
import { QuizQuestionService } from './quiz-question.service';

/** Service handling the quiz maker state and actions */
@Injectable({
  providedIn: 'root'
})
export class QuizMakerService {

  readonly #categoryService = inject(QuizCategoryService);
  readonly #questionService = inject(QuizQuestionService);
  readonly #difficultyService = inject(QuizDifficultyService);
  readonly #router = inject(Router);

  /** Quiz lines */
  #quizLines = signal<QuizLineModel[]>([]);
  quizLines = computed(() => this.#quizLines());

  /** Quiz lines loading indicator */
  #areQuizLinesLoading = signal<boolean>(false);
  areQuizLinesLoading = computed(() => this.#areQuizLinesLoading());

  /** Quiz maker KO indicator */
  #isQuizMakerKo = signal<boolean>(false);
  isQuizMakerKo = computed(() => this.#isQuizMakerKo());

  /** Quiz categories */
  #quizCategories = signal<QuizCategoryModel[]>([]);
  quizCategories = computed(() => this.#quizCategories());

  /** Quiz categories loading indicator */
  #areQuizCategoriesLoading = signal<boolean>(false);
  areQuizCategoriesLoading = computed(() => this.#areQuizCategoriesLoading());

  /** Selected quiz category */
  #selectedQuizCategory = signal<string | null>(null);
  selectedQuizCategory$ = computed(() => this.#selectedQuizCategory());

  /** Quiz subcategories */
  #quizSubcategories = computed(() => {
    const categories = this.quizCategories();
    const selectedCategory = this.selectedQuizCategory$();

    // If no category, no subcategory
    if(categories.length === 0) return [];

    // Else filter on selected category and get only distinct subcategory name
    const nonDistinctSubcategories = categories
      .filter(category => category.subcategory && category.name === selectedCategory)
      .map(category => category.subcategory!);

    // Return distinct subcategories
    return [...new Set(nonDistinctSubcategories)];
  });
  quizSubcategories = computed(() => this.#quizSubcategories());

  /** Quiz difficulties */
  #quizDifficulties = signal<QuizDifficultyModel[]>([]);
  quizDifficulties = computed(() => this.#quizDifficulties());

  /** Quiz difficulties loading indicator */
  #areQuizDifficultiesLoading = signal<boolean>(false);
  areQuizDifficultiesLoading = computed(() => this.#areQuizDifficultiesLoading());

  /** Complete quiz indicator */
  #isQuizComplete = signal<boolean>(false);
  isQuizComplete = computed(() => this.#isQuizComplete());

  /** Quiz config used to create the last quiz */
  #actualQuizConfig = signal<QuizConfigModel | null>(null)

  /** Indicates if a question can be changed */
  #canQuestionBeChanged = signal<boolean>(true);
  canQuestionBeChanged = computed(() => this.#canQuestionBeChanged());

  /**
   * Initialize the quiz categories
   * @returns the quiz categories
   */
  initializeQuizCategories(): Observable<QuizCategoryModel[]> {
    if(this.quizCategories().length > 0) {
      return of(this.quizCategories());
    }

    // Start categories loading
    this.#areQuizCategoriesLoading.set(true);

    return this.#categoryService.getQuizCategories()
    .pipe(
      // Initialize quiz categories
      tap(categories => {
        this.#quizCategories.set(categories);
      }),
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
        this.handleQuizError('Error retrieving categories', error)
      ),
      // Stop categories loading even if an error occurs
      finalize(() => {
        this.#areQuizCategoriesLoading.set(false);
      })
    );
  }

  /**
   * Initialize the quiz difficulties
   * @returns the quiz difficulties
   */
  initializeQuizDifficulties(): Observable<QuizDifficultyModel[]> {
    if(this.quizDifficulties().length) {
      return of(this.quizDifficulties());
    }

    // Start difficulties loading
    this.#areQuizDifficultiesLoading.set(true);

    return this.#difficultyService.getQuizDifficulties()
    .pipe(
      // Initialize quiz difficulties
      tap(difficulties => {
        this.#quizDifficulties.set(difficulties);
      }),
      // Handle error while retrieving difficulties
      catchError((error: HttpErrorResponse) =>
        this.handleQuizError('Error retrieving difficulties', error)
      ),
      // Stop difficulties loading even if an error occurs
      finalize(() => {
        this.#areQuizDifficultiesLoading.set(false);
      })
    )
  }

  /**
   * Reload the quiz
   */
  reloadQuiz(): void {
    // Reset quiz maker ko indicator
    this.#isQuizMakerKo.set(false);

    // Redirect to quiz page
    this.#router.navigate(['']);
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.#selectedQuizCategory.set(category);
  }

  /**
   * Create quiz lines from a quiz configuration
   * @param quizConfig the quiz configuration
   * @returns the quiz lines
   */
  createQuizLines(quizConfig: QuizConfigModel | null): Observable<ApiQuestionModel[]> {
    // Start quiz lines loading
    this.#areQuizLinesLoading.set(true);
    
    // If no config, return empty quiz
    if(!quizConfig) {
      this.#areQuizLinesLoading.set(false);
      return of([]);
    }

    // Get quiz category
    const quizCategory = this.getQuizCategory(quizConfig);

    // Save config in a signal (used for question change)
    this.#actualQuizConfig.set(quizConfig);

    // Get questions from category id and config difficulty
    return this.#questionService.getApiQuestions(quizCategory.id, quizConfig.difficulty!)
      .pipe(
        tap(apiQuestions => {
          const quizLines = apiQuestions.map(apiQuestion => this.createQuizLineFromApiQuestion(apiQuestion));
          this.#quizLines.set(quizLines);
          this.#router.navigate([`/${ROUTE_PATHS.QUIZ}`]);
        }),
        // Handle error while creating quiz lines
        catchError((error: HttpErrorResponse) => {
          return this.handleQuizError('Error creating quiz lines', error)
        }),
        // Stop quiz lines loading even if an error occurs
        finalize(() => {
          this.#areQuizLinesLoading.set(false);
        })
      );
  }

  /**
   * Update quiz state and complete indicator with a quiz answer
   * @param quizAnswer the quiz answer
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.updateQuizState(quizAnswer);
    this.updateIsQuizComplete();
  }

  /**
   * Change the quiz line passed as a parameter
   * @param quizLineToChange the quiz line to change
   * @returns the new question
   */
  changeQuizLine(quizLineToChange: QuizLineModel): Observable<ApiQuestionModel> {
    // Get last config category and difficulty
    const configCategory = this.#actualQuizConfig()?.category;
    const configDifficulty = this.#actualQuizConfig()?.difficulty;
    const categories = this.#quizCategories();

    // If no category, no difficulty or no categories, stop stream
    if(!configCategory || !configDifficulty || !categories) {
      return EMPTY;
    }

    // Get quiz category
    const quizCategory = this.getQuizCategory(this.#actualQuizConfig());

    // Indicate that quiz lines are loading
    this.#areQuizLinesLoading.set(true);

    // Get new lines
    return this.#questionService.getApiQuestions(quizCategory.id, configDifficulty)
    .pipe(
      // Select new API questions
      mergeMap(apiQuestions => {
        return this.selectNewApiQuestion(apiQuestions);
      }),
      tap(newApiQuestion => {
        // Replace quiz line
        this.replaceQuizLine(quizLineToChange, newApiQuestion);

        // Question can not be changed twice
        this.#canQuestionBeChanged.set(false);

        // Quiz is not complete anymore
        this.#isQuizComplete.set(false);
      }),
      // Retry until a new question is found
      retry(),
      finalize(() => {
        this.#areQuizLinesLoading.set(false);
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
    this.resetQuiz();
    this.#router.navigate([`/${ROUTE_PATHS.HOME}`]);
  }

  /**
   * Handle a quiz error by logging the error and alerting the user
   * @param explicitErrorMessage the explicit error message to log 
   * @param error the original error to log
   * @returns an empty Observable that stop the stream
   */
  private handleQuizError(explicitErrorMessage: string, error: HttpErrorResponse): Observable<never> {
    // Update quiz maker ko indicator
    this.#isQuizMakerKo.set(true);
    
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
  private createQuizLineFromApiQuestion(apiQuestion: ApiQuestionModel): QuizLineModel {
    return {
      question: apiQuestion.question,
      answers: QuizMakerUtils.shuffleAnswers([...apiQuestion.incorrect_answers, apiQuestion.correct_answer]),// Randomize answers
      correctAnswer: apiQuestion.correct_answer,
      userAnswer: null,
    };
  }

  /**
   * Update quiz state with a quiz answer
   * @param quizAnswer the quiz answer
   */
  private updateQuizState(quizAnswer: QuizAnswerModel): void {
    this.#quizLines.update(value => {
      return [...value].map(quizLine => {
        if(quizLine.question === quizAnswer.question) {
          quizLine.userAnswer = quizAnswer.answer;
        }
        return quizLine;
      })
    });
  }

  /**
   * Update complete quiz indicator (a quiz is complete if the user answered all the questions)
   */
  private updateIsQuizComplete(): void {
    const everyLineHasAnAnswer = this.#quizLines().every(quizLine =>!!quizLine.userAnswer);
    this.#isQuizComplete.set(everyLineHasAnAnswer);
  }

  /**
   * Reset the quiz
   */
  private resetQuiz(): void {
    // Empty quiz lines
    this.#quizLines.set([]);

    // Quiz is not complete anymore
    this.#isQuizComplete.set(false);

    // Quiz config is reset
    this.#actualQuizConfig.set(null);

    // No category is selected
    this.#selectedQuizCategory.set(null);

    // Bonus question can be used again
    this.#canQuestionBeChanged.set(true);
  }

  /**
   * Get a quiz category from the config passed as parameter
   * @param quizConfig he quiz config
   * @returns the quiz category
   */
  private getQuizCategory(quizConfig: QuizConfigModel | null): QuizCategoryModel {
    const quizCategories = this.#quizCategories();
    
    // If no config or no categories, return null
    if(!quizConfig || quizCategories.length === 0) {
      throw new Error('No quiz config or quiz categories defined');
    }

    // Get quiz category
    const quizCategory = quizCategories.find(category => {
      const isSameCategory = category.name === quizConfig.category;
      
      if(quizConfig.subcategory) {
        const isSameSubcategory = category.subcategory === quizConfig.subcategory;
        return isSameCategory && isSameSubcategory;
      }

      return isSameCategory;
    });

    // If category doesn't exist, throw an error
    if(!quizCategory) {
      throw new Error(`Quiz category ${quizCategory} doesn't exist`);
    }

    return quizCategory;
  }

  /**
   * Select a new api question (different from those of the actual quiz)
   * @param apiQuestions the api questions potentially containing the new question
   * @returns the new api question
   */
  private selectNewApiQuestion(apiQuestions: ApiQuestionModel[]): Observable<ApiQuestionModel> {
    // Get actual questions
    const actualQuestions = this.#quizLines().map(quizLine => quizLine.question);
      
    // Get only questions different from the actual ones
    const newApiQuestions = apiQuestions.filter(apiQuestion => !actualQuestions.includes(apiQuestion.question));

    // If no new question, throw an error (launch retry)
    if(newApiQuestions.length === 0) {
      return throwError(() => 'No new question found');
    }

    // Else take first new api question
    return of(newApiQuestions[0]);
  }

  /**
   * Replace a line in the actual quiz lines
   * @param quizLineToChange le line to change
   * @param newApiQuestion the new question
   */
  private replaceQuizLine(quizLineToChange: QuizLineModel, newApiQuestion: ApiQuestionModel) {
    // Create new quiz line
    // Note: must look for a question until it's a different one from the others
    const newQuizLine = this.createQuizLineFromApiQuestion(newApiQuestion);

    // Copy actual quiz lines and replace quiz line to change
    const newQuizLines = [...this.#quizLines()].map(quizLine => {
      return (quizLine.question === quizLineToChange.question) ? newQuizLine : quizLine;
    });

    // Update quiz lines
    this.#quizLines.set(newQuizLines)
  }

}
