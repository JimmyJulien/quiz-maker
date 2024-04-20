import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QuizAnswerModel } from 'src/app/models/quiz-answer.model';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { AnswerColorPipe } from 'src/app/pipes/answer-color.pipe';

@Component({
  selector: 'qzm-quiz-lines',
  templateUrl: './quiz-lines.component.html',
  styleUrl: './quiz-lines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    AnswerColorPipe,
  ]
})
export class QuizLinesComponent {
  
  /** Quiz lines loading indicator from the parent */
  areQuizLinesLoading = input<boolean | null>(false);

  /** Quiz lines from the parent */
  quizLines = input<QuizLineModel[] | null>([]);

  /** Indicates if a question can be changed */
  canQuestionBeChanged = input<boolean | null>(true);

  /** Indicates if quiz lines are disabled */
  disabled = input<boolean | null>(false);

  /** Pick answer event emitter to the parent */
  pickAnswer = output<QuizAnswerModel>();
  
  /** Ask to change the quiz line sent by the event emitter */
  changeQuizLine = output<QuizLineModel>();

}
