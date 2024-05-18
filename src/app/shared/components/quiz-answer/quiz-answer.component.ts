import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'qzm-quiz-answer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './quiz-answer.component.html',
  styleUrl: './quiz-answer.component.scss'
})
export class QuizAnswerComponent {

  answer = input.required<string>();
  correctAnswer = input.required<string>();
  userAnswer = input<string | null>(null);
  disabled = input<boolean>(false);
  pick = output<void>();

  answerClass = computed(() => {
    // If disabled and answer is the correct answer => green
    if(this.disabled() && this.answer() === this.correctAnswer()) {
      return 'correct';
    }

    // If disabled and answer is the user answer but it's not the correct answer => red
    if(this.disabled() && this.answer() === this.userAnswer() && this.correctAnswer() !== this.userAnswer()) {
      return 'incorrect';
    }

    // If enabled and answer is the user answer 
    if(!this.disabled() && this.answer() === this.userAnswer()) {
      return 'picked';
    }

    // Else default color
    return '';
  });
}
