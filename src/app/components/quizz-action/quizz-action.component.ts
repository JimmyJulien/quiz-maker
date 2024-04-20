import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'qzm-quizz-action',
  templateUrl: './quizz-action.component.html',
  styleUrl: './quizz-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuizzActionComponent {

  /** Indicates if results are shown */
  areResultsShown = input<boolean | null>(false);

  /** Indicates if quizz is complete */
  isQuizzComplete = input<boolean | null>(false);

  /** Action event emitter to the parent */
  action = output<'submit' | 'create'>();

}
