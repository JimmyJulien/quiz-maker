import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuizAnswerModel } from 'src/app/shared/models/quiz-answer.model';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

@Component({
  selector: 'qzm-quiz-lines',
  templateUrl: './quiz-lines.component.html',
  styleUrls: ['./quiz-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizLinesComponent {
  
  /** Quiz lines loading indicator from the parent */
  @Input() areQuizLinesLoading: boolean | null = false;

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] | null = [];

  /** Pick answer event emitter to the parent */
  @Output() pickAnswer = new EventEmitter<QuizAnswerModel>();

  /**
   * Emit a pick answer event to the parent
   * @param answer the answer to emit
   * @param question the question to emit
   */
  pickAnswerForQuestion(answer: string, question: string) {
    this.pickAnswer.emit({ answer, question });
  }

}
