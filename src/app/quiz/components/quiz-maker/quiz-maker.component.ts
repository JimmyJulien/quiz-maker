import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QuizDifficultyModel } from 'src/app/quiz/models/quiz-difficulty.model';
import { QuizConstants } from '../../constants/quiz.constants';
import { QuizAnswerModel } from '../../models/quiz-answer.model';
import { QuizCategoryModel } from '../../models/quiz-category.model';
import { QuizFormModel } from '../../models/quiz-form.model';
import { QuizLineModel } from '../../models/quiz-line.model';
import { QuizService } from '../../services/quiz.service';

@Component({
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizMakerComponent implements OnDestroy {
  
  readonly QUIZ_MAKER_KO = QuizConstants.ERR_QUIZ_MAKER_KO;

  /** Quiz categories loading indicator from the quiz service */
  areQuizCategoriesLoading$ = this.quizService.getAreQuizCategoriesLoading();

  /** Quiz lines loading indicator from the quiz service */
  areQuizLinesLoading$ = this.quizService.getAreQuizLinesLoading();

  /** Quiz maker KO indicator from the quiz service */
  isQuizMakerKo$ = this.quizService.getIsQuizMakerKo();

  /** Quiz categories from the quiz service */
  quizCategories$: Observable<QuizCategoryModel[]> = this.quizService.getQuizCategories();

  /** Quiz difficulties from the quiz service */
  quizDifficulties: QuizDifficultyModel[] = this.quizService.getQuizDifficulties();

  /** Quiz lines from the quiz service */
  quizLines$: Observable<QuizLineModel[]> = this.quizService.getQuizLines();

  /** Quiz complete indicator from the quiz service */
  isQuizComplete$: Observable<boolean> = this.quizService.getIsQuizComplete();
  
  /** Subscription used to unsubscribe when the component is destroyed */
  souscription = new Subscription();

  constructor(private readonly quizService: QuizService) {}

  /**
   * Unsubscribe souscription
   */
  ngOnDestroy(): void {
    this.souscription.unsubscribe();
  }

  /**
   * Create quiz lines from the quiz configuration passed in parameter
   * @param quizConfig the quiz configuration
   */
  createQuizLines(quizConfig: QuizFormModel): void {
    this.souscription.add(
      this.quizService.createQuizLines(quizConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.quizService.pickAnswer(quizAnswer);
  }

  /**
   * Go to the quiz results when answers are submitted
   */
  onSubmit(): void {
    this.quizService.goToQuizResults();
  }
}
