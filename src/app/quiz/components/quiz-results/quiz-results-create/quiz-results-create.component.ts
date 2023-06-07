import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-results-create',
  templateUrl: './quiz-results-create.component.html',
  styleUrls: ['./quiz-results-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultsCreateComponent {

  /** Create new quiz event to the parent */
  @Output() createNew = new EventEmitter<void>();

  /**
   * Create new quiz by emitting a create new event
   */
  createNewQuiz(): void {
    this.createNew.emit();
  }
}
