import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-action',
  templateUrl: './quiz-action.component.html',
  styleUrl: './quiz-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuizActionComponent {

  /** Indicates if results are shown */
  areResultsShown = input<boolean | null>(false);

  /** Indicates if quiz is complete */
  isQuizComplete = input<boolean | null>(false);

  /** Action event emitter to the parent */
  action = output<'submit' | 'create'>();

}
