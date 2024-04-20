import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'qzm-quizz-ko',
  templateUrl: './quizz-ko.component.html',
  styleUrl: './quizz-ko.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuizzKoComponent {

  /** Reload event emitter to the parent */
  reload = output<void>();

}
