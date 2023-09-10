import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qzm-quizz-action',
  templateUrl: './quizz-action.component.html',
  styleUrls: ['./quizz-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf],
})
export class QuizzActionComponent {

  /** Indicates if results are shown */
  @Input() areResultsShown: boolean | null = false;

  /** Indicates if quizz is complete */
  @Input() isQuizzComplete: boolean | null = false;

  /** Action event emitter to the parent */
  @Output() action = new EventEmitter<'submit' | 'create'>();

}
