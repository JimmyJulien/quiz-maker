import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

@Component({
  selector: 'qzm-results-lines',
  templateUrl: './results-lines.component.html',
  styleUrls: ['./results-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsLinesComponent {

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] = [];

}
