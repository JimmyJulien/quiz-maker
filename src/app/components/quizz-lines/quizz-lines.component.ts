import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  areQuizzLinesLoading = input<boolean | null>(false);

  /** Quizz lines from the parent */
  quizLines = input<QuizzLineModel[] | null>([]);

  /** Indicates if a question can be changed */
  canQuestionBeChanged = input<boolean | null>(true);

  /** Indicates if quizz lines are disabled */
  disabled = input<boolean | null>(false);

  /** Pick answer event emitter to the parent */
  pickAnswer = output<QuizzAnswerModel>();
  
  /** Ask to change the quizz line sent by the event emitter */
  changeQuizzLine = output<QuizzLineModel>();

}
