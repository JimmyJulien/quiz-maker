import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-ko',
  templateUrl: './quiz-ko.component.html',
  styleUrl: './quiz-ko.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuizKoComponent {

  /** Reload event emitter to the parent */
  reload = output<void>();

}
