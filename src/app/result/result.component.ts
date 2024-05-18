import { Component, inject } from '@angular/core';
import { QuizLineComponent } from '../shared/components/quiz-line/quiz-line.component';
import { QuizMakerService } from '../shared/services/quiz-maker.service';
import { ResultScoreComponent } from './result-score/result-score.component';

@Component({
  selector: 'qzm-result',
  standalone: true,
  imports: [
    QuizLineComponent,
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
