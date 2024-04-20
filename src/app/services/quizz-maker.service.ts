import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, finalize, mergeMap, of, retry, tap, throwError } from 'rxjs';
import { ApiQuestionModel } from 'src/app/models/api-question.model';
import { QuizzAnswerModel } from '../models/quizz-answer.model';
import { QuizzCategoryModel } from '../models/quizz-category.model';
import { QuizzConfigModel } from '../models/quizz-config.model';
import { QuizzDifficultyModel } from '../models/quizz-difficulty.model';
import { QuizzLineModel } from '../models/quizz-line.model';
import { QuizzMakerUtils } from '../utils/quizz-maker.utils';
import { QuizzCategoryService } from './quizz-category.service';
import { QuizzDifficultyService } from './quizz-difficulty.service';
import { QuizzQuestionService } from './quizz-question.service';

/** Service handling the quizz maker state and actions */
@Injectable({
  providedIn: 'root'
})
export class QuizzMakerService {

  readonly #categoryService = inject(QuizzCategoryService);
  readonly #questionService = inject(QuizzQuestionService);
  readonly #difficultyService = inject(QuizzDifficultyService);
  readonly #router = inject(Router);

  /** Quizz lines */
  #quizzLines = signal<QuizzLineModel[]>([]);
  quizzLines = computed(() => this.#quizzLines());

  /** Quizz lines loading indicator */
  #areQuizzLinesLoading = signal<boolean>(false);
  areQuizzLinesLoading = computed(() => this.#areQuizzLinesLoading());

  /** Quizz maker KO indicator */
  #isQuizzMakerKo = signal<boolean>(false);
  isQuizzMakerKo = computed(() => this.#isQuizzMakerKo());

  /** Quizz categories */
  #quizzCategories = signal<QuizzCategoryModel[]>([]);
  quizzCategories = computed(() => this.#quizzCategories());

  /** Quizz categories loading indicator */
  #areQuizzCategoriesLoading = signal<boolean>(false);
  areQuizzCategoriesLoading = computed(() => this.#areQuizzCategoriesLoading());

  /** Selected quizz category */
  #selectedQuizzCategory = signal<string | null>(null);
  selectedQuizzCategory$ = computed(() => this.#selectedQuizzCategory());

  /** Quizz subcategories */
  #quizzSubcategories = computed(() => {
    const categories = this.quizzCategories();
    const selectedCategory = this.selectedQuizzCategory$();

    // If no category, no subcategory
    if(categories.length === 0) return [];

    // Else filter on selected category and get only distinct subcategory name
    const nonDistinctSubcategories = categories
      .filter(category => category.subcategory && category.name === selectedCategory)
      .map(category => category.subcategory!);

    // Return distinct subcategories
    return [...new Set(nonDistinctSubcategories)];
  });
  quizzSubcategories = computed(() => this.#quizzSubcategories());

  /** Quizz difficulties */
  #quizzDifficulties = signal<QuizzDifficultyModel[]>([]);
  quizzDifficulties = computed(() => this.#quizzDifficulties());

  /** Quizz difficulties loading indicator */
  #areQuizzDifficultiesLoading = signal<boolean>(false);
  areQuizzDifficultiesLoading = computed(() => this.#areQuizzDifficultiesLoading());

  /** Complete quizz indicator */
  #isQuizzComplete = signal<boolean>(false);
  isQuizzComplete = computed(() => this.#isQuizzComplete());

  /** Quizz config used to create the last quizz */
  #actualQuizzConfig = signal<QuizzConfigModel | null>(null)

  /** Indicates if a question can be changed */
  #canQuestionBeChanged = signal<boolean>(true);
  canQuestionBeChanged = computed(() => this.#canQuestionBeChanged());

  /** Indicates if results are shown */
  #areResultsShown = signal<boolean>(false);
  areResultsShown = computed(() => this.#areResultsShown());

  /**
   * Initialize the quizz categories
   * @returns the quizz categories
   */
  initializeQuizzCategories(): Observable<QuizzCategoryModel[]> {
    // Start categories loading
    this.#areQuizzCategoriesLoading.set(true);

    return this.#categoryService.getQuizzCategories()
    .pipe(
      // Initialize quizz categories
      tap(categories => {
        this.#quizzCategories.set(categories);
      }),
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
        this.handleQuizzError('Error retrieving categories', error)
      ),
      // Stop categories loading even if an error occurs
      finalize(() => {
        this.#areQuizzCategoriesLoading.set(false);
      })
    );
  }

  /**
   * Initialize the quizz difficulties
   * @returns the quizz difficulties
   */
  initializeQuizzDifficulties(): Observable<QuizzDifficultyModel[]> {
    // Start difficulties loading
    this.#areQuizzDifficultiesLoading.set(true);

    return this.#difficultyService.getQuizzDifficulties()
    .pipe(
      // Initialize quizz difficulties
      tap(difficulties => {
        this.#quizzDifficulties.set(difficulties);
      }),
      // Handle error while retrieving difficulties
      catchError((error: HttpErrorResponse) =>
        this.handleQuizzError('Error retrieving difficulties', error)
      ),
      // Stop difficulties loading even if an error occurs
      finalize(() => {
        this.#areQuizzDifficultiesLoading.set(false);
      })
    )
  }

  /**
   * Reload the quizz
   */
  reloadQuizz(): void {
    // Reset quizz maker ko indicator
    this.#isQuizzMakerKo.set(false);

    // Redirect to quizz page
    this.#router.navigate(['']);
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.#selectedQuizzCategory.set(category);
  }

  /**
   * Create quizz lines from a quizz configuration
   * @param quizzConfig the quizz configuration
   * @returns the quizz lines
   */
  createQuizzLines(quizzConfig: QuizzConfigModel | null): Observable<ApiQuestionModel[]> {
    // Start quizz lines loading
    this.#areQuizzLinesLoading.set(true);
    
    // If no config, return empty quizz
    if(!quizzConfig) {
      this.#areQuizzLinesLoading.set(false);
      return of([]);
    }

    // Get quizz category
    const quizzCategory = this.getQuizzCategory(quizzConfig);

    // Save config in a signal (used for question change)
    this.#actualQuizzConfig.set(quizzConfig);

    // Get questions from category id and config difficulty
    return this.#questionService.getApiQuestions(quizzCategory.id, quizzConfig.difficulty!)
      .pipe(
        tap(apiQuestions => {
          const quizzLines = apiQuestions.map(apiQuestion => this.createQuizzLineFromApiQuestion(apiQuestion));
          this.#quizzLines.set(quizzLines);
        }),
        // Handle error while creating quizz lines
        catchError((error: HttpErrorResponse) => {
          return this.handleQuizzError('Error creating quizz lines', error)
        }),
        // Stop quizz lines loading even if an error occurs
        finalize(() => {
          this.#areQuizzLinesLoading.set(false);
        })
      );
  }

  /**
   * Update quizz state and complete indicator with a quizz answer
   * @param quizAnswer the quizz answer
   */
  pickAnswer(quizAnswer: QuizzAnswerModel): void {
    this.updateQuizzState(quizAnswer);
    this.updateIsQuizzComplete();
  }

  /**
   * Change the quizz line passed as a parameter
   * @param quizLineToChange the quizz line to change
   * @returns the new question
   */
  changeQuizzLine(quizLineToChange: QuizzLineModel): Observable<ApiQuestionModel> {
    // Get last config category and difficulty
    const configCategory = this.#actualQuizzConfig()?.category;
    const configDifficulty = this.#actualQuizzConfig()?.difficulty;
    const categories = this.#quizzCategories();

    // If no category, no difficulty or no categories, stop stream
    if(!configCategory || !configDifficulty || !categories) {
      return EMPTY;
    }

    // Get quizz category
    const quizCategory = this.getQuizzCategory(this.#actualQuizzConfig());

    // Get new lines
    return this.#questionService.getApiQuestions(quizCategory.id, configDifficulty)
    .pipe(
      // Select new API questions
      mergeMap(apiQuestions => {
        return this.selectNewApiQuestion(apiQuestions);
      }),
      tap(newApiQuestion => {
        // Replace quizz line
        this.replaceQuizzLine(quizLineToChange, newApiQuestion);

        // Question can not be changed twice
        this.#canQuestionBeChanged.set(false);
      }),
      // Quizz is not complete anymore
      tap(() => {
        this.#isQuizzComplete.set(false);
      }),
      // Retry until a new question is found
      retry(),
    );
  }
  
  /**
   * Show quizz results
   */
  showQuizzResults(): void {
    this.#areResultsShown.set(true);
  }

  /**
   * Reset the quizz and navigate to the quizz page
   */
  createNewQuizz(): void {
    this.resetQuizz();
  }

  /**
   * Handle a quizz error by logging the error and alerting the user
   * @param explicitErrorMessage the explicit error message to log 
   * @param error the original error to log
   * @returns an empty Observable that stop the stream
   */
  private handleQuizzError(explicitErrorMessage: string, error: HttpErrorResponse): Observable<never> {
    // Update quizz maker ko indicator
    this.#isQuizzMakerKo.set(true);
    
    // Log error in the browser console
    console.error(explicitErrorMessage, error);

    // return an empty Observable to stop the stream
    return EMPTY;
  }

  /**
   * Create a quizz line from a quizz question
   * @param apiQuestion the quizz question
   * @returns the quizz line
   */
  private createQuizzLineFromApiQuestion(apiQuestion: ApiQuestionModel): QuizzLineModel {
    return {
      question: apiQuestion.question,
      answers: QuizzMakerUtils.shuffleAnswers([...apiQuestion.incorrect_answers, apiQuestion.correct_answer]),// Randomize answers
      correctAnswer: apiQuestion.correct_answer,
      userAnswer: null,
    };
  }

  /**
   * Update quizz state with a quizz answer
   * @param quizAnswer the quizz answer
   */
  private updateQuizzState(quizAnswer: QuizzAnswerModel): void {
    this.#quizzLines.update(value => {
      return [...value].map(quizLine => {
        if(quizLine.question === quizAnswer.question) {
          quizLine.userAnswer = quizAnswer.answer;
        }
        return quizLine;
      })
    });
  }

  /**
   * Update complete quizz indicator (a quizz is complete if the user answered all the questions)
   */
  private updateIsQuizzComplete(): void {
    const everyLineHasAnAnswer = this.#quizzLines().every(quizLine =>!!quizLine.userAnswer);
    this.#isQuizzComplete.set(everyLineHasAnAnswer);
  }

  /**
   * Reset the quizz
   */
  private resetQuizz(): void {
    // Empty quizz lines
    this.#quizzLines.set([]);

    // Quizz is not complete anymore
    this.#isQuizzComplete.set(false);

    // Quizz config is reset
    this.#actualQuizzConfig.set(null);

    // No category is selected
    this.#selectedQuizzCategory.set(null);

    // Bonus question can be used again
    this.#canQuestionBeChanged.set(true);

    // Results are not shown anymore
    this.#areResultsShown.set(false);
  }

  /**
   * Get a quizz category from the config passed as parameter
   * @param quizzConfig he quizz config
   * @returns the quizz category
   */
  private getQuizzCategory(quizzConfig: QuizzConfigModel | null): QuizzCategoryModel {
    const quizzCategories = this.#quizzCategories();
    
    // If no config or no categories, return null
    if(!quizzConfig || quizzCategories.length === 0) {
      throw new Error('No quizz config or quizz categories defined');
    }

    // Get quizz category
    const quizzCategory = quizzCategories.find(category => {
      const isSameCategory = category.name === quizzConfig.category;
      
      if(quizzConfig.subcategory) {
        const isSameSubcategory = category.subcategory === quizzConfig.subcategory;
        return isSameCategory && isSameSubcategory;
      }

      return isSameCategory;
    });

    // If category doesn't exist, throw an error
    if(!quizzCategory) {
      throw new Error(`Quizz category ${quizzCategory} doesn't exist`);
    }

    return quizzCategory;
  }

  /**
   * Select a new api question (different from those of the actual quizz)
   * @param apiQuestions the api questions potentially containing the new question
   * @returns the new api question
   */
  private selectNewApiQuestion(apiQuestions: ApiQuestionModel[]): Observable<ApiQuestionModel> {
    // Get actual questions
    const actualQuestions = this.#quizzLines().map(quizzLine => quizzLine.question);
      
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
   * Replace a line in the actual quizz lines
   * @param quizzLineToChange le line to change
   * @param newApiQuestion the new question
   */
  private replaceQuizzLine(quizzLineToChange: QuizzLineModel, newApiQuestion: ApiQuestionModel) {
    // Create new quizz line
    // Note: must look for a question until it's a different one from the others
    const newQuizzLine = this.createQuizzLineFromApiQuestion(newApiQuestion);

    // Copy actual quizz lines and replace quizz line to change
    const newQuizzLines = [...this.#quizzLines()].map(quizzLine => {
      return (quizzLine.question === quizzLineToChange.question) ? newQuizzLine : quizzLine;
    });

    // Update quizz lines
    this.#quizzLines.set(newQuizzLines)
  }

}
