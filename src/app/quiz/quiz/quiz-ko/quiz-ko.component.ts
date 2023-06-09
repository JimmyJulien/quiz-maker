import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-ko',
  templateUrl: './quiz-ko.component.html',
  styleUrls: ['./quiz-ko.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizKoComponent {

  /** Reload event emitter to the parent */
  @Output() reload = new EventEmitter<void>();

  /**
   * Reload click event handler
   */
  onReloadClick() {
    this.reload.emit();
  }

}
