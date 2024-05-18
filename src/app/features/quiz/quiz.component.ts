import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { QuizLineComponent } from 'src/app/shared/components/quiz-line/quiz-line.component';
import { QuizAnswerModel } from 'src/app/shared/models/quiz-answer.model';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';
import { QuizMakerService } from 'src/app/shared/services/quiz-maker.service';

@Component({
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [QuizLineComponent],
})
export class QuizComponent implements OnDestroy {
  
  readonly #quizMakerService = inject(QuizMakerService);

  /** Quiz maker KO indicator from the quiz service */
  isQuizMakerKo = this.#quizMakerService.isQuizMakerKo();

  /** Quiz lines loading indicator from the quiz service */
  areQuizLinesLoading = this.#quizMakerService.areQuizLinesLoading();

  /** Quiz lines from the quiz service */
  quizLines = this.#quizMakerService.getQuizLines();

  /** Indicates if a question can be changed */
  canQuestionBeChanged = this.#quizMakerService.canQuestionBeChanged();

  /** Quiz complete indicator from the quiz service */
  isQuizComplete = this.#quizMakerService.isQuizComplete();

  /** Subscription used to unsubscribe when the component is destroyed */
  subscription = new Subscription();

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
    this.#quizMakerService.reloadQuiz();
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.#quizMakerService.pickAnswer(quizAnswer);
  }

  /**
   * Change  the quiz line passed as a parameter
   * @param quizLine the quiz line to change
   */  
  changeQuizLine(quizLine: QuizLineModel): void {
    this.subscription.add(
      this.#quizMakerService.changeQuizLine(quizLine).subscribe()
    );
  }

  /**
   * Show the quiz results
   */
  showResults(): void {
    this.#quizMakerService.showQuizResults();
  }

}
