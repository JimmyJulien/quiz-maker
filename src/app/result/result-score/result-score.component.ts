import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResultScoreColorPipe } from 'src/app/result/result-score/result-score-color.pipe';
import { ResultScoreFormatPipe } from 'src/app/result/result-score/result-score-format.pipe';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

@Component({
  selector: 'qzm-result-score',
  templateUrl: './result-score.component.html',
  styleUrl: './result-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ResultScoreColorPipe,
    ResultScoreFormatPipe,
  ]
})
export class ResultScoreComponent {
  quizLines = input<QuizLineModel[] | null>([]);
}
