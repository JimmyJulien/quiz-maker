import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';
import { QuizMakerService } from 'src/app/shared/services/quiz-maker.service';

@Component({
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {

  /** Result lines from the quiz service */
  quizLines$: Observable<QuizLineModel[]> = this.quizMakerService.getQuizLines();

  constructor(private readonly quizMakerService: QuizMakerService) {}

  /**
   * Create a new quiz
   */
  createNewQuiz(): void {
    this.quizMakerService.createNewQuiz();
  }
}
