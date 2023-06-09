import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

@Component({
  selector: 'qzm-results-score',
  templateUrl: './results-score.component.html',
  styleUrls: ['./results-score.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsScoreComponent {

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] = [];
  
}
