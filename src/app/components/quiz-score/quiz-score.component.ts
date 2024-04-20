import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { ScoreColorPipe } from 'src/app/pipes/score-color.pipe';
import { ScoreFormatPipe } from 'src/app/pipes/score-format.pipe';

@Component({
  selector: 'qzm-quiz-score',
  templateUrl: './quiz-score.component.html',
  styleUrl: './quiz-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ScoreColorPipe,
    ScoreFormatPipe,
  ]
})
export class QuizScoreComponent {
  /** Quiz lines from the parent */
  quizLines = input<QuizLineModel[] | null>([]);
}
