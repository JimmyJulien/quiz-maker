import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'qzm-results-create',
  templateUrl: './results-create.component.html',
  styleUrls: ['./results-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsCreateComponent {

  /** Create new quiz event to the parent */
  @Output() createNew = new EventEmitter<void>();

  /**
   * Create new quiz by emitting a create new event
   */
  createNewQuiz(): void {
    this.createNew.emit();
  }
}
