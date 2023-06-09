import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-submit',
  templateUrl: './quiz-submit.component.html',
  styleUrls: ['./quiz-submit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizSubmitComponent {

  /** Quiz complete indicator from the parent */
  @Input() isQuizComplete: boolean | null = false;

  /** Submit event emitter to the parent */
  @Output() submit = new EventEmitter<void>();

  /**
   * Emit a submit event to the parent
   */
  onSubmit() {
    this.submit.emit();
  }
}
