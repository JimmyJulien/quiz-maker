import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { ScoreColorPipe } from 'src/app/pipes/score-color.pipe';
import { ScoreFormatPipe } from 'src/app/pipes/score-format.pipe';

@Component({
  selector: 'qzm-result-score',
  templateUrl: './result-score.component.html',
  styleUrl: './result-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ScoreColorPipe,
    ScoreFormatPipe,
  ]
})
export class ResultScoreComponent {
  quizLines = input<QuizLineModel[] | null>([]);
}
