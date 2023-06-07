import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizLineModel } from '../../models/quiz-line.model';
import { QuizService } from '../../services/quiz.service';

@Component({
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultsComponent {

  /** Quiz lines from the quiz service */
  quizLines$: Observable<QuizLineModel[]> = this.quizService.getQuizLines();

  constructor(private readonly quizService: QuizService) {}

  /**
   * Create a new quiz
   */
  createNewQuiz(): void {
    this.quizService.createNewQuiz();
  }
}
