import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'qzm-quizz-ko',
  templateUrl: './quizz-ko.component.html',
  styleUrls: ['./quizz-ko.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuizzKoComponent {

  /** Reload event emitter to the parent */
  @Output() reload = new EventEmitter<void>();

  /**
   * Reload click event handler
   */
  onReloadClick() {
    this.reload.emit();
  }

}
