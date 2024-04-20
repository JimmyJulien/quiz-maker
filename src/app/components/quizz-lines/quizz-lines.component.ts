import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuizzAnswerModel } from 'src/app/models/quizz-answer.model';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { AnswerColorPipe } from 'src/app/pipes/answer-color.pipe';

@Component({
  selector: 'qzm-quizz-lines',
  templateUrl: './quizz-lines.component.html',
  styleUrl: './quizz-lines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    AnswerColorPipe,
  ]
})
export class QuizzLinesComponent {
  
  /** Quizz lines loading indicator from the parent */
  @Input() areQuizzLinesLoading: boolean | null = false;

  /** Quizz lines from the parent */
  @Input() quizLines: QuizzLineModel[] | null = [];

  /** Indicates if a question can be changed */
  @Input() canQuestionBeChanged: boolean | null = true;

  /** Indicates if quizz lines are disabled */
  @Input() disabled: boolean | null = false;

  /** Pick answer event emitter to the parent */
  @Output() pickAnswer = new EventEmitter<QuizzAnswerModel>();
  
  /** Ask to change the quizz line sent by the event emitter */
  @Output() changeQuizzLine = new EventEmitter<QuizzLineModel>();

  /**
   * Emit a pick answer event to the parent
   * @param answer the answer to emit
   * @param question the question to emit
   */
  pickAnswerForQuestion(answer: string, question: string): void {
    this.pickAnswer.emit({ answer, question });
  }

  /**
   * Ask to change the quizz line selected
   * @param quizLine the quizz line to change
   */
  onChangeQuizzLine(quizLine: QuizzLineModel): void {
    this.changeQuizzLine.emit(quizLine);
  }

}
