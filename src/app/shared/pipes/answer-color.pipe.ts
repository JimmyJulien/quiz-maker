import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';

/** Pipe used to transform an answer and a quiz line into a color class */
@Pipe({
  name: 'qzmAnswerColor',
  pure: false,
  standalone: true,
})
export class AnswerColorPipe implements PipeTransform {

  /**
   * Transform an answer and a quiz line into a color class
   * @param answer the answer
   * @param quizLine the quiz line
   * @returns the answer color class
   */
  transform(
    answer: string,
    quizLine: QuizLineModel,
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
