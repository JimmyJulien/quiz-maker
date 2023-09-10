import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, finalize, map, mergeMap, of, retry, tap, throwError } from 'rxjs';
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

  /** Quizz categories loading indicator */
  private areQuizzCategoriesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quizz lines loading indicator */
  private areQuizzLinesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quizz maker KO indicator */
  private isQuizzMakerKo$ = new BehaviorSubject<boolean>(false);

  /** Quizz categories */
  private quizCategories$ = new BehaviorSubject<QuizzCategoryModel[] | null>(null);

  /** Selected quizz category */
  private selectedQuizzCategory$ = new BehaviorSubject<string | null>(null);

  /** Quizz lines */
  private quizLines$ = new BehaviorSubject<QuizzLineModel[]>([]);

  /** Complete quizz indicator */
  private isQuizzComplete$ = new BehaviorSubject<boolean>(false);

  /** Quizz config used to create the last quizz */
  private actualQuizzConfig$ = new BehaviorSubject<QuizzConfigModel | null>(null)

  /** Indicates if a question can be changed */
  private canQuestionBeChanged$ = new BehaviorSubject<boolean>(true);

  /** Indicates if results are shown */
  private areResultsShown$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly categoryService: QuizzCategoryService,
    private readonly questionService: QuizzQuestionService,
    private readonly difficultyService: QuizzDifficultyService,
    private readonly router: Router,
  ) {}

  /**
   * Get the quizz categories loading indicator as an Observable
   * @returns the quizz categories loading indicator as an Observable
   */
  areQuizzCategoriesLoading(): Observable<boolean> {
    return this.areQuizzCategoriesLoading$.asObservable();
  }

  /**
   * Get the quizz lines loading indicator as an Observable
   * @returns the quizz lines loading indicator as an Observable
   */
  areQuizzLinesLoading(): Observable<boolean> {
    return this.areQuizzLinesLoading$.asObservable();
  }

  /**
   * Get the quizz maker ko indicator as an Observable
   * @returns the quizz maker ko indicator as an Observable
   */
  isQuizzMakerKo(): Observable<boolean> {
    return this.isQuizzMakerKo$.asObservable();
  }

  /**
   * Check if the user can change a question
   * @returns true if question hasn't already been changed, false else
   */
  canQuestionBeChanged(): Observable<boolean> {
    return this.canQuestionBeChanged$.asObservable();
  }

  /**
   * Indicate if results are actually shown
   * @returns true if results are shown
   */
  areResultsShown(): Observable<boolean> {
    return this.areResultsShown$.asObservable();
  }

  /**
   * Initialize the quizz categories
   * @returns the quizz categories
   */
  initializeQuizzCategories(): Observable<QuizzCategoryModel[]> {
    // Start categories loading
    this.areQuizzCategoriesLoading$.next(true);

    return this.categoryService.getQuizzCategories()
    .pipe(
      // Initialize quizz categories
      tap(categories => this.quizCategories$.next(categories)),
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
        this.handleQuizzError('Error retrieving categories', error)
      ),
      // Stop categories loading even if an error occurs
      finalize(() => this.areQuizzCategoriesLoading$.next(false))
    );
  }

  /**
   * Get quizz categories
   * @returns quizz categories
   */
  getQuizzCategories(): Observable<string[] | null> {
    return this.quizCategories$.asObservable()
      .pipe(
        map(categories => categories?.map(category => category.name)),
        map(categories => [...new Set(categories)])
      );
  }

  /**
   * Get quizz subcategories
   * @returns quizz subcategories
   */
  getQuizzSubcategories(): Observable<string[] | null> {
    return combineLatest([
      this.quizCategories$,
      this.selectedQuizzCategory$,
    ])
    .pipe(
      map(([categories, selectedCategory]) => {
        // If no category, no subcategory
        if(!categories) return null;

        // Else filter on selected category and get only distinct subcategory name
        const nonDistinctSubcategories = categories
          .filter(category => category.subcategory && category.name === selectedCategory)
          .map(category => category.subcategory!);

        // Return distinct subcategories
        return [...new Set(nonDistinctSubcategories)];
      })
    );
  }

  /**
   * Get quizz difficulties
   * @returns the quizz difficulties
   */
  getQuizzDifficulties(): Observable<QuizzDifficultyModel[]> {
    return this.difficultyService.getQuizzDifficulties();
  }

  /**
   * Get the quizz lines
   * @returns the quizz lines
   */
  getQuizzLines(): Observable<QuizzLineModel[]> {
    return this.quizLines$.asObservable();
  }

  /**
   * Get the quizz complete indicator as an Observable
   * @returns the quizz complete indicator as an Observable
   */
  isQuizzComplete(): Observable<boolean> {
    return this.isQuizzComplete$.asObservable();
  }

  /**
   * Reload the quizz
   */
  reloadQuizz(): void {
    // Reset quizz maker ko indicator
    this.isQuizzMakerKo$.next(false);

    // Redirect to quizz page
    this.router.navigate(['']);
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.selectedQuizzCategory$.next(category);
  }

  /**
   * Create quizz lines from a quizz configuration
   * @param quizConfig the quizz configuration
   * @returns the quizz lines
   */
  createQuizzLines(quizConfig: QuizzConfigModel | null): Observable<ApiQuestionModel[]> {
    // Start quizz lines loading
    this.areQuizzLinesLoading$.next(true);
    
    // If no config, return empty quizz
    if(!quizConfig) {
      this.areQuizzLinesLoading$.next(false);
      return of([]);
    }

    // Get quizz category
    const quizCategory = this.getQuizzCategory(quizConfig);

    // Save config in a subject (used for question change)
    this.actualQuizzConfig$.next(quizConfig);

    // Get questions from category id and config difficulty
    return this.questionService.getApiQuestions(quizCategory.id, quizConfig.difficulty!)
      .pipe(
        tap(apiQuestions => {
          this.quizLines$.next(
            apiQuestions.map(
              // Map into quizz line
              apiQuestion => this.createQuizzLineFromApiQuestion(apiQuestion)
            )
          );
        }),
        // Handle error while creating quizz lines
        catchError((error: HttpErrorResponse) => 
          this.handleQuizzError('Error creating quizz lines', error)
        ),
        // Stop quizz lines loading even if an error occurs
        finalize(() => this.areQuizzLinesLoading$.next(false))
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
    const configCategory = this.actualQuizzConfig$.value?.category;
    const configDifficulty = this.actualQuizzConfig$.value?.difficulty;
    const categories = this.quizCategories$.value;

    // If no category, no difficulty or no categories, stop stream
    if(!configCategory || !configDifficulty || !categories) {
      return EMPTY;
    }

    // Get quizz category
    const quizCategory = this.getQuizzCategory(this.actualQuizzConfig$.value);

    // Get new lines
    return this.questionService.getApiQuestions(quizCategory.id, configDifficulty)
    .pipe(
      // Select new API questions
      mergeMap(apiQuestions => this.selectNewApiQuestion(apiQuestions)),
      // Replace quizz line
      tap(newApiQuestion => this.replaceQuizzLine(quizLineToChange, newApiQuestion)),
      // Quizz is not complete anymore
      tap(() =>  this.isQuizzComplete$.next(false)),
      // Retry until a new question is found
      retry(),
    );
  }
  
  /**
   * Show quizz results
   */
  showQuizzResults(): void {
    this.areResultsShown$.next(true);
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
    this.isQuizzMakerKo$.next(true);
    
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
    this.quizLines$.next(
      [...this.quizLines$.value].map(quizLine => {
        if(quizLine.question === quizAnswer.question) {
          quizLine.userAnswer = quizAnswer.answer;
        }
        return quizLine;
      })
    );
  }

  /**
   * Update complete quizz indicator (a quizz is complete if the user answered all the questions)
   */
  private updateIsQuizzComplete(): void {
    this.isQuizzComplete$.next(
      this.quizLines$.value.every(quizLine => !!quizLine.userAnswer)
    );
  }

  /**
   * Reset the quizz
   */
  private resetQuizz(): void {
    // Empty quizz lines
    this.quizLines$.next([]);

    // Quizz is not complete anymore
    this.isQuizzComplete$.next(false);

    // Quizz config is reset
    this.actualQuizzConfig$.next(null);

    // No category is selected
    this.selectedQuizzCategory$.next(null);

    // Bonus question can be used again
    this.canQuestionBeChanged$.next(true);

    // Results are not shown anymore
    this.areResultsShown$.next(false);
  }

  /**
   * Get a quizz category from the config passed as parameter
   * @param quizConfig he quizz config
   * @returns the quizz category
   */
  private getQuizzCategory(quizConfig: QuizzConfigModel | null): QuizzCategoryModel {
    // If no config or no categories, return null
    if(!quizConfig || !this.quizCategories$.value) {
      throw new Error('No quizz config or quizz categories defined');
    }

    // Get quizz category
    const quizCategory = this.quizCategories$.value.find(
      category => category.name === quizConfig.category
    );

    // If category doesn't exist, throw an error
    if(!quizCategory) {
      throw new Error(`Quizz category ${quizCategory} doesn't exist`);
    }

    return quizCategory;
  }

  /**
   * Select a new api question (different from those of the actual quizz)
   * @param apiQuestions the api questions potentially containing the new question
   * @returns the new api question
   */
  private selectNewApiQuestion(apiQuestions: ApiQuestionModel[]): Observable<ApiQuestionModel> {
    // Get actual questions
    const actualQuestions = this.quizLines$.value.map(
      quizLine => quizLine.question
    );
      
    // Get only questions different from the actual ones
    const newApiQuestions = apiQuestions.filter(
      apiQuestion => !actualQuestions.includes(apiQuestion.question)
    );

    // If no new question, throw an error (launch retry)
    if(newApiQuestions.length === 0) {
      return throwError(() => 'No new question found');
    }

    // Else take first new api question
    return of(newApiQuestions[0]);
  }

  /**
   * Replace a line in the actual quizz lines
   * @param quizLineToChange le line to change
   * @param newApiQuestion the new question
   */
  private replaceQuizzLine(quizLineToChange: QuizzLineModel, newApiQuestion: ApiQuestionModel) {
    // Create new quizz line
    // Note: must look for a question until it's a different one from the others
    const newQuizzLine = this.createQuizzLineFromApiQuestion(newApiQuestion);

    // Copy actual quizz lines and replace quizz line to change
    const newQuizzLines = [...this.quizLines$.value].map(quizLine => 
      (quizLine.question === quizLineToChange.question) ? newQuizzLine : quizLine
    );

    // Update quizz lines
    this.quizLines$.next(newQuizzLines)

    // Question can not be changed twice
    this.canQuestionBeChanged$.next(false);
  }

}
