import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from '../models/quiz-line.model';

/** Pipe used to transform an answer and a quiz line into a color class */
@Pipe({
  name: 'qzmAnswerColor'
})
export class AnswerColorPipe implements PipeTransform {

  /**
   * Transform an answer and a quiz line into a color class
   * @param answer the answer
   * @param quizLine the quiz line
   * @returns the answer color class
   */
  transform(answer: string, quizLine: QuizLineModel): 'correct' | 'incorrect' | '' {
    // If answer is the correct answer => green
    if(answer === quizLine.correctAnswer) {
      return 'correct';
    }
    // If answer is the user answer but it's not the correct answer => red
    else if(answer === quizLine.userAnswer && quizLine.correctAnswer !== quizLine.userAnswer) {
      return 'incorrect';
    }
    // Else no color
    else {
      return '';
    }
  }

}
