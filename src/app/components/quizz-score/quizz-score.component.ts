import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { ScoreColorPipe } from 'src/app/pipes/score-color.pipe';
import { ScoreFormatPipe } from 'src/app/pipes/score-format.pipe';

@Component({
  selector: 'qzm-quizz-score',
  templateUrl: './quizz-score.component.html',
  styleUrl: './quizz-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ScoreColorPipe,
    ScoreFormatPipe,
  ]
})
export class QuizzScoreComponent {
  /** Quizz lines from the parent */
  quizLines = input<QuizzLineModel[] | null>([]);
}
