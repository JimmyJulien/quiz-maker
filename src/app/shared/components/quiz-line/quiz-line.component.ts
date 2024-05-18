import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { QuizAnswerModel } from '../../models/quiz-answer.model';
import { QuizLineModel } from '../../models/quiz-line.model';
import { AnswerColorPipe } from '../../pipes/answer-color.pipe';

@Component({
  selector: 'qzm-quiz-line',
  standalone: true,
  imports: [NgClass, AnswerColorPipe],
  templateUrl: './quiz-line.component.html',
  styleUrl: './quiz-line.component.scss'
})
export class QuizLineComponent {
  quizLine = input.required<QuizLineModel>();
  disabled = input<boolean>(false);
  canQuestionBeChanged = input<boolean>(true);
  pickAnswer = output<QuizAnswerModel>();
  changeQuizLine = output<QuizLineModel>();
}
