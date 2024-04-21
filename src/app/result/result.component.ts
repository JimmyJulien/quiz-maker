import { Component, inject } from '@angular/core';
import { QuizMakerService } from '../services/quiz-maker.service';
import { QuizLinesComponent } from '../shared/components/quiz-lines/quiz-lines.component';
import { ResultScoreComponent } from './result-score/result-score.component';

@Component({
  selector: 'qzm-result',
  standalone: true,
  imports: [
    QuizLinesComponent,
    ResultScoreComponent,
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
  
  readonly #quizMakerService = inject(QuizMakerService);

  /** Quiz lines from the quiz service */
  quizLines = this.#quizMakerService.quizLines;

  /**
   * Create a new Quiz
   */
  createNewQuiz(): void {
    this.#quizMakerService.createNewQuiz();
  }

}
