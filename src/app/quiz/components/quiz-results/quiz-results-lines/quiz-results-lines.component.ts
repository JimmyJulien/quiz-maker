import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuizLineModel } from 'src/app/quiz/models/quiz-line.model';

@Component({
  selector: 'qzm-quiz-results-lines',
  templateUrl: './quiz-results-lines.component.html',
  styleUrls: ['./quiz-results-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultsLinesComponent {

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] = [];

}
