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

  /** Indicates if a question can be changed */
  @Input() canQuestionBeChanged: boolean | null = true;

  /** Pick answer event emitter to the parent */
  @Output() pickAnswer = new EventEmitter<QuizAnswerModel>();
  
  /** Ask to change the quiz line sent by the event emitter */
  @Output() changeQuizLine = new EventEmitter<QuizLineModel>();

  /**
   * Emit a pick answer event to the parent
   * @param answer the answer to emit
   * @param question the question to emit
   */
  pickAnswerForQuestion(answer: string, question: string): void {
    this.pickAnswer.emit({ answer, question });
  }

  /**
   * Ask to change the quiz line selected
   * @param quizLine the quiz line to change
   */
  onChangeQuizLine(quizLine: QuizLineModel): void {
    this.changeQuizLine.emit(quizLine);
  }

}
