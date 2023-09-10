import { Pipe, PipeTransform } from '@angular/core';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';

/** Pipe used to transform an answer and a quizz line into a color class */
@Pipe({
  name: 'qzmAnswerColor',
  pure: false,
  standalone: true,
})
export class AnswerColorPipe implements PipeTransform {

  /**
   * Transform an answer and a quizz line into a color class
   * @param answer the answer
   * @param quizLine the quizz line
   * @returns the answer color class
   */
  transform(
    answer: string,
    quizLine: QuizzLineModel,
    disabled: boolean | null,
  ): 'picked' | 'correct' | 'incorrect' | '' {

    // If disabled and answer is the correct answer => green
    if(disabled && answer === quizLine.correctAnswer) {
      return 'correct';
    }

    // If disabled and answer is the user answer but it's not the correct answer => red
    if(disabled && answer === quizLine.userAnswer && quizLine.correctAnswer !== quizLine.userAnswer) {
      return 'incorrect';
    }

    // If enabled and answer is the user answer 
    if(!disabled && answer === quizLine.userAnswer) {
      return 'picked';
    }

    // Else default color
    return '';
   
  }

}
