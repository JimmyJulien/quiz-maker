import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuizLineModel } from 'src/app/quiz/models/quiz-line.model';

@Component({
  selector: 'qzm-quiz-results-score',
  templateUrl: './quiz-results-score.component.html',
  styleUrls: ['./quiz-results-score.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultsScoreComponent {

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] = [];
  
}
