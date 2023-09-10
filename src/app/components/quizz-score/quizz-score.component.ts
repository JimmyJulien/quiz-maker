import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { ScoreColorPipe } from 'src/app/pipes/score-color.pipe';
import { ScoreFormatPipe } from 'src/app/pipes/score-format.pipe';

@Component({
  selector: 'qzm-quizz-score',
  templateUrl: './quizz-score.component.html',
  styleUrls: ['./quizz-score.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ScoreColorPipe,
    ScoreFormatPipe,
  ]
})
export class QuizzScoreComponent {
  /** Quizz lines from the parent */
  @Input() quizLines: QuizzLineModel[] | null = [];
}
