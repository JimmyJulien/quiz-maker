import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { QuizConstants } from '../constants/quiz.constants';
import { QuizAnswerModel } from '../models/quiz-answer.model';
import { QuizCategoryModel } from '../models/quiz-category.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizFormModel } from '../models/quiz-form.model';
import { QuizLineModel } from '../models/quiz-line.model';
import { QuizQuestionModel } from '../models/quiz-question.model';
import { QuizCategoryRepositoryService } from './quiz-category-repository.service';
import { QuizQuestionRepositoryService } from './quiz-question-repository.service';

/** Service handling the quiz state and actions */
@Injectable({
  providedIn: 'root'
})
export class QuizService {

  /** Quiz categories loading indicator */
  private areQuizCategoriesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quiz lines loading indicator */
  private areQuizLinesLoading$ = new BehaviorSubject<boolean>(false);

  /** Quiz maker KO indicator */
  private isQuizMakerKo$ = new BehaviorSubject<boolean>(false);

  /** Quiz lines of the quiz */
  private quizLines$ = new BehaviorSubject<QuizLineModel[]>([]);

  /** Complet quiz indicator */
  private isQuizComplete$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly quizCategoryService: QuizCategoryRepositoryService,
    private readonly quizQuestionsRepositoryService: QuizQuestionRepositoryService,
    private readonly router: Router,
  ) {}

  /**
   * Get the quiz categories loading indicator as an Observable
   * @returns the quiz categories loading indicator as an Observable
   */
  getAreQuizCategoriesLoading(): Observable<boolean> {
    return this.areQuizCategoriesLoading$.asObservable();
  }

  /**
   * Get the quiz lines loading indicator as an Observable
   * @returns the quiz lines loading indicator as an Observable
   */
  getAreQuizLinesLoading(): Observable<boolean> {
    return this.areQuizLinesLoading$.asObservable();
  }

  /**
   * Get the quiz maker ko indicator as an Observable
   * @returns the quiz maker ko indicator as an Observable
   */
  getIsQuizMakerKo(): Observable<boolean> {
    return this.isQuizMakerKo$.asObservable();
  }

  /**
   * Get the quiz categories
   * @returns the quiz categories
   */
  getQuizCategories(): Observable<QuizCategoryModel[]> {
    // Start categories loading
    this.areQuizCategoriesLoading$.next(true);

    return this.quizCategoryService.getQuizCategories()
    .pipe(
      // Handle error while retrieving categories
      catchError((error: HttpErrorResponse) => 
          this.handleQuizError(QuizConstants.ERR_RETRIEVING_CATEGORIES, error)
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
  getIsQuizComplete(): Observable<boolean> {
    return this.isQuizComplete$.asObservable();
  }

  /**
   * Create quiz lines from a quiz configuration
   * @param quizConfig the quiz configuration
   * @returns the quiz lines
   */
  createQuizLines(quizConfig: QuizFormModel) {
    // Start quiz lines loading
    this.areQuizLinesLoading$.next(true);

    // Get quiz questions
    return this.quizQuestionsRepositoryService.getQuizQuestions(quizConfig)
      .pipe(
        tap(quizQuestions => {
          this.quizLines$.next(
            quizQuestions.map(
              // Map into quiz line
              quizQuestion => this.createQuizLineFromQuizQuestion(quizQuestion)
            )
          );
        }),
        // Handle error while creating quiz lines
        catchError((error: HttpErrorResponse) => 
          this.handleQuizError(QuizConstants.ERR_CREATING_QUIZ_LINES, error)
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
    this.router.navigate(['quiz/results']);
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

    // Alert the user that Quiz Maker is KO
    alert(QuizConstants.ERR_QUIZ_MAKER_KO);

    // return an empty Observable to stop the stream
    return EMPTY;
  }

  /**
   * Create a quiz line from a quiz question
   * @param quizQuestion the quiz question
   * @returns the quiz line
   */
  private createQuizLineFromQuizQuestion(quizQuestion: QuizQuestionModel): QuizLineModel {
    return {
      question: quizQuestion.question,
      answers: this.shuffleAnswers([...quizQuestion.incorrectAnswers, quizQuestion.correctAnswer]),// Randomize answers
      correctAnswer: quizQuestion.correctAnswer,
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
