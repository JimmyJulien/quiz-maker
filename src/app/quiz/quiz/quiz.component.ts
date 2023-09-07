import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QuizAnswerModel } from 'src/app/shared/models/quiz-answer.model';
import { QuizConfigModel } from 'src/app/shared/models/quiz-config.model';
import { QuizDifficultyModel } from 'src/app/shared/models/quiz-difficulty.model';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';
import { QuizMakerService } from 'src/app/shared/services/quiz-maker.service';

@Component({
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent implements OnDestroy {
  
  /** Quiz categories loading indicator from the quiz service */
  areQuizCategoriesLoading$ = this.quizMakerService.areQuizCategoriesLoading();

  /** Quiz lines loading indicator from the quiz service */
  areQuizLinesLoading$ = this.quizMakerService.areQuizLinesLoading();

  /** Quiz maker KO indicator from the quiz service */
  isQuizMakerKo$ = this.quizMakerService.isQuizMakerKo();

  /** Quiz categories from the quiz service */
  quizCategories$: Observable<string[] | null> = this.quizMakerService.getQuizCategories();

  /** Quiz subcategories */
  quizSubcategories$: Observable<string[] | null> = this.quizMakerService.getQuizSubcategories();

  /** Quiz difficulties from the quiz service */
  quizDifficulties: QuizDifficultyModel[] = this.quizMakerService.getQuizDifficulties();

  /** Quiz lines from the quiz service */
  quizLines$: Observable<QuizLineModel[]> = this.quizMakerService.getQuizLines();

  /** Quiz complete indicator from the quiz service */
  isQuizComplete$: Observable<boolean> = this.quizMakerService.isQuizComplete();
  
  /** Indicates if a question can be changed */
  canQuestionBeChanged$ = this.quizMakerService.canQuestionBeChanged();

  /** Subscription used to unsubscribe when the component is destroyed */
  subscription = new Subscription();

  constructor(private readonly quizMakerService: QuizMakerService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.quizMakerService.initializeQuizCategories().subscribe()
    );
  }

  /**
   * Unsubscribe subscription
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Reload quiz
   */
  onReload(): void {
    this.quizMakerService.reloadQuiz();
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string): void {
    this.quizMakerService.selectCategory(category);
  }

  /**
   * Create quiz lines from the quiz configuration passed in parameter
   * @param quizConfig the quiz configuration
   */
  createQuizLines(quizConfig: QuizConfigModel): void {
    this.subscription.add(
      this.quizMakerService.createQuizLines(quizConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.quizMakerService.pickAnswer(quizAnswer);
  }

  /**
   * Change  the quiz line passed as a parameter
   * @param quizLine the quiz line to change
   */  
  changeQuizLine(quizLine: QuizLineModel): void {
    this.subscription.add(
      this.quizMakerService.changeQuizLine(quizLine).subscribe()
    );
  }

  /**
   * Go to the quiz results when answers are submitted
   */
  onSubmit(): void {
    this.quizMakerService.goToQuizResults();
  }
}
