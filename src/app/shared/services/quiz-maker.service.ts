import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
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

  /** Quiz lines */
  private quizLines$ = new BehaviorSubject<QuizLineModel[]>([]);

  /** Complete quiz indicator */
  private isQuizComplete$ = new BehaviorSubject<boolean>(false);

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
   * Get the quiz categories
   * @returns the quiz categories
   */
  getQuizCategories(): Observable<QuizCategoryModel[]> {
    // Start categories loading
    this.areQuizCategoriesLoading$.next(true);

    return this.apiCategoryRepositoryService.getCategories()
    .pipe(
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
          this.handleQuizError('Error retrieving categories', error)
        ),
      // Stop categories loading even if an error occurs
      finalize(() => this.areQuizCategoriesLoading$.next(false))
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
   * Create quiz lines from a quiz configuration
   * @param quizConfig the quiz configuration
   * @returns the quiz lines
   */
  createQuizLines(quizConfig: QuizConfigModel) {
    // Start quiz lines loading
    this.areQuizLinesLoading$.next(true);

    // Get quiz questions
    // Note: quizConfig category and difficulty can't be null here because
    // they are required in the form used to create the quiz
    return this.apiQuestionRepositoryService.getQuestions(quizConfig.category!, quizConfig.difficulty!)
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
  pickAnswer(quizAnswer: QuizAnswerModel) {
    this.updateQuizState(quizAnswer);
    this.updateIsQuizComplete();
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
      // Copy for immutability
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
    this.quizLines$.next([]);
    this.isQuizComplete$.next(false);
  }
}
