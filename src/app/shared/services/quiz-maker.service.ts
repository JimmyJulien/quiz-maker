import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, finalize, map, mergeMap, of, retry, tap, throwError } from 'rxjs';
import { ApiQuestionModel } from 'src/app/api/api-question/api-question.model';
import { ApiCategoryRepositoryService } from '../../api/api-category/api-category-repository.service';
import { ApiQuestionRepositoryService } from '../../api/api-question/api-question-repository.service';
import { QuizAnswerModel } from '../models/quiz-answer.model';
import { QuizCategoryModel } from '../models/quiz-category.model';
import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizLineModel } from '../models/quiz-line.model';

/** Service handling the quiz maker state and actions */
@Injectable({
  providedIn: 'root'
})
export class QuizMakerService {

  /** Quiz categories loading indicator */
  private areQuizCategoriesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quiz lines loading indicator */
  private areQuizLinesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quiz maker KO indicator */
  private isQuizMakerKo$ = new BehaviorSubject<boolean>(false);

  /** Quiz categories */
  private quizCategories$ = new BehaviorSubject<QuizCategoryModel[] | null>(null);

  /** Selected quiz category */
  private selectedQuizCategory$ = new BehaviorSubject<string | null>(null);

  /** Quiz lines */
  private quizLines$ = new BehaviorSubject<QuizLineModel[]>([]);

  /** Complete quiz indicator */
  private isQuizComplete$ = new BehaviorSubject<boolean>(false);

  /** Quiz config used to create the last quiz */
  private quizConfig$ = new BehaviorSubject<QuizConfigModel | null>(null)

  /** Indicates if a question can be changed */
  private canQuestionBeChanged$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly apiCategoryRepositoryService: ApiCategoryRepositoryService,
    private readonly apiQuestionRepositoryService: ApiQuestionRepositoryService,
    private readonly router: Router,
  ) {}

  /**
   * Get the quiz categories loading indicator as an Observable
   * @returns the quiz categories loading indicator as an Observable
   */
  areQuizCategoriesLoading(): Observable<boolean> {
    return this.areQuizCategoriesLoading$.asObservable();
  }

  /**
   * Get the quiz lines loading indicator as an Observable
   * @returns the quiz lines loading indicator as an Observable
   */
  areQuizLinesLoading(): Observable<boolean> {
    return this.areQuizLinesLoading$.asObservable();
  }

  /**
   * Get the quiz maker ko indicator as an Observable
   * @returns the quiz maker ko indicator as an Observable
   */
  isQuizMakerKo(): Observable<boolean> {
    return this.isQuizMakerKo$.asObservable();
  }

  /**
   * Check if the user can change a question
   * @returns true if question hasn't already been changed, false else
   */
  canQuestionBeChanged(): Observable<boolean> {
    return this.canQuestionBeChanged$.asObservable();
  }

  /**
   * Get formatted quiz categories
   * @returns the formatted quiz categories
   */
  getFormattedQuizCategories(): Observable<QuizCategoryModel[]> {
    // Separator used to identify categories that need formatting
    const separator = ': ';

    return this.apiCategoryRepositoryService.getCategories()
    .pipe(
      map(categories =>
        categories.map(category => {
          // If category name contains separator, split to get name and subcategory
          if(category.name.includes(separator)) {
            return {
              id: category.id,
              name: category.name.split(separator)[0],
              subcategory: category.name.split(separator)[1]
            }
          }

          // Else use category name and no subcategory
          return {
            id: category.id,
            name: category.name,
            subcategory: null,
          };
        })
      )
    );
  }

  /**
   * Initialize the quiz categories
   * @returns the quiz categories
   */
  initializeQuizCategories(): Observable<QuizCategoryModel[]> {
    // Start categories loading
    this.areQuizCategoriesLoading$.next(true);

    return this.getFormattedQuizCategories()
    .pipe(
      // Initialize quiz categories
      tap(categories => this.quizCategories$.next(categories)),
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
        this.handleQuizError('Error retrieving categories', error)
      ),
      // Stop categories loading even if an error occurs
      finalize(() => this.areQuizCategoriesLoading$.next(false))
    );
  }

  /**
   * Get quiz categories
   * @returns quiz categories
   */
  getQuizCategories(): Observable<string[] | null> {
    return this.quizCategories$.asObservable()
      .pipe(
        map(categories => categories?.map(category => category.name)),
        map(categories => [...new Set(categories)])
      );
  }

  /**
   * Get quiz subcategories
   * @returns quiz subcategories
   */
  getQuizSubcategories(): Observable<string[] | null> {
    return combineLatest([
      this.quizCategories$,
      this.selectedQuizCategory$,
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
   * Get the quiz difficulties
   * @returns the quiz difficulties
   */
  getQuizDifficulties(): QuizDifficultyModel[] {
    return [
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ]
  }

  /**
   * Get the quiz lines
   * @returns the quiz lines
   */
  getQuizLines(): Observable<QuizLineModel[]> {
    return this.quizLines$.asObservable();
  }

  /**
   * Get the quiz complete indicator as an Observable
   * @returns the quiz complete indicator as an Observable
   */
  isQuizComplete(): Observable<boolean> {
    return this.isQuizComplete$.asObservable();
  }

  /**
   * Reload the quiz
   */
  reloadQuiz(): void {
    // Reset quiz maker ko indicator
    this.isQuizMakerKo$.next(false);

    // Redirect to quiz page
    this.router.navigate(['']);
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string): void {
    this.selectedQuizCategory$.next(category);
  }

  /**
   * Create quiz lines from a quiz configuration
   * @param quizConfig the quiz configuration
   * @returns the quiz lines
   */
  createQuizLines(quizConfig: QuizConfigModel | null): Observable<ApiQuestionModel[]> {
    // Start quiz lines loading
    this.areQuizLinesLoading$.next(true);
    
    // If no config, return empty quiz
    if(!quizConfig) {
      this.areQuizLinesLoading$.next(false);
      return of([]);
    }

    // Get quiz category
    const quizCategory = this.getQuizCategory(quizConfig);

    // Save config in a subject (used for question change)
    this.quizConfig$.next(quizConfig);

    // Get questions from category id and config difficulty
    return this.apiQuestionRepositoryService.getQuestions(quizCategory.id, quizConfig.difficulty!)
      .pipe(
        tap(apiQuestions => {
          this.quizLines$.next(
            apiQuestions.map(
              // Map into quiz line
              apiQuestion => this.createQuizLineFromApiQuestion(apiQuestion)
            )
          );
        }),
        // Handle error while creating quiz lines
        catchError((error: HttpErrorResponse) => 
          this.handleQuizError('Error creating quiz lines', error)
        ),
        // Stop quiz lines loading even if an error occurs
        finalize(() => this.areQuizLinesLoading$.next(false))
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
    const configCategory = this.quizConfig$.value?.category;
    const configDifficulty = this.quizConfig$.value?.difficulty;
    const categories = this.quizCategories$.value;

    // If no category, no difficulty or no categories, stop stream
    if(!configCategory || !configDifficulty || !categories) {
      return EMPTY;
    }

    // Get quiz category
    const quizCategory = this.getQuizCategory(this.quizConfig$.value);

    // Get new lines
    return this.apiQuestionRepositoryService.getQuestions(quizCategory.id, configDifficulty)
    .pipe(
      tap(console.log),
      // Select new API questions
      mergeMap(apiQuestions => this.selectNewApiQuestion(apiQuestions)),
      // Replace quiz line
      tap(newApiQuestion => this.replaceQuizLine(quizLineToChange, newApiQuestion)),
      // Quiz is not complete anymore
      tap(() =>  this.isQuizComplete$.next(false)),
      // Retry until a new question is found
      retry(),
    );
  }
  
  /**
   * Navigate to the quiz results page
   */
  goToQuizResults(): void {
    this.router.navigate(['results']);
  }

  /**
   * Reset the quiz and navigate to the quiz page
   */
  createNewQuiz(): void {
    this.resetQuiz();
    this.router.navigate(['quiz']);
  }

  /**
   * Handle a quiz error by logging the error and alerting the user
   * @param explicitErrorMessage the explicit error message to log 
   * @param error the original error to log
   * @returns an empty Observable that stop the stream
   */
  private handleQuizError(explicitErrorMessage: string, error: HttpErrorResponse): Observable<never> {
    // Update quiz maker ko indicator
    this.isQuizMakerKo$.next(true);
    
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
      answers: this.shuffleAnswers([...apiQuestion.incorrect_answers, apiQuestion.correct_answer]),// Randomize answers
      correctAnswer: apiQuestion.correct_answer,
      userAnswer: null,
    };
  }

  /**
   * Shuffle answers passed in parameters
   * @param answers the answers to shuffle
   * @returns the shuffled answers
   */
  private shuffleAnswers(answers: string[]): string[] {
    return answers
      .map(answer => ({ value: answer, sortValue: Math.random()}))
      .sort((answer1, answer2) => answer1.sortValue - answer2.sortValue)
      .map(({value}) => value);
  }

  /**
   * Update quiz state with a quiz answer
   * @param quizAnswer the quiz answer
   */
  private updateQuizState(quizAnswer: QuizAnswerModel): void {
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
   * Update complete quiz indicator (a quiz is complete if the user answered all the questions)
   */
  private updateIsQuizComplete(): void {
    this.isQuizComplete$.next(
      this.quizLines$.value.every(quizLine => !!quizLine.userAnswer)
    );
  }

  /**
   * Reset the quiz
   */
  private resetQuiz(): void {
    // Empty quiz lines
    this.quizLines$.next([]);

    // Quiz is not complete anymore
    this.isQuizComplete$.next(false);

    // Quiz config is reset
    this.quizConfig$.next(null);

    // No category is selected
    this.selectedQuizCategory$.next(null);

    // Bonus question can be used again
    this.canQuestionBeChanged$.next(true);
  }

  /**
   * Get a quiz category from the config passed as parameter
   * @param quizConfig he quiz config
   * @returns the quiz category
   */
  private getQuizCategory(quizConfig: QuizConfigModel | null): QuizCategoryModel {
    // If no config or no categories, return null
    if(!quizConfig || !this.quizCategories$.value) {
      throw new Error('No quiz config or quiz categories defined');
    }

    // Get quiz category
    const quizCategory = this.quizCategories$.value.find(
      category => category.name === quizConfig.category
    );

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
   * Replace a line in the actual quiz lines
   * @param quizLineToChange le line to change
   * @param newApiQuestion the new question
   */
  private replaceQuizLine(quizLineToChange: QuizLineModel, newApiQuestion: ApiQuestionModel) {
    // Create new quiz line
    // Note: must look for a question until it's a different one from the others
    const newQuizLine = this.createQuizLineFromApiQuestion(newApiQuestion);

    // Copy actual quiz lines and replace quiz line to change
    const newQuizLines = [...this.quizLines$.value].map(quizLine => 
      (quizLine.question === quizLineToChange.question) ? newQuizLine : quizLine
    );

    // Update quiz lines
    this.quizLines$.next(newQuizLines)

    // Question can not be changed twice
    this.canQuestionBeChanged$.next(false);
  }

}
