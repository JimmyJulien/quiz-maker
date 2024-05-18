import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

@Component({
  selector: 'qzm-result-score',
  templateUrl: './result-score.component.html',
  styleUrl: './result-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass]
})
export class ResultScoreComponent {
  
  quizLines = input.required<QuizLineModel[]>();

  correctAnswersNumber = computed(() => {
    return this.quizLines()
    .filter(quizLine => quizLine.userAnswer === quizLine.correctAnswer)
    .length;
  });

  scoreColor = computed(() => {
    // Get correct answers number
    const correctAnswersNumber: number = this.correctAnswersNumber();

    // If 0 or 1 correct answers => red
    if(correctAnswersNumber === 0 || correctAnswersNumber === 1) {
      return 'incorrect';
    }

    // If 2 or 3 correct answers => yellow
    if(correctAnswersNumber === 2 || correctAnswersNumber === 3) {
      return 'neutral';
    }

    // Else => green
    return 'correct';
  });

  scoreText = computed(() => {
    return `You scored ${this.correctAnswersNumber()} out of ${this.quizLines().length}`;
  })
}
