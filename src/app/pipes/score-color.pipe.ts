import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { QuizMakerUtils } from 'src/app/utils/quiz-maker.utils';
import { ZeroToFive } from '../types/zero-to-five.type';

/** Pipe used to transform quiz lines into a score color class */
@Pipe({
  name: 'qzmScoreColor',
  standalone: true,
})
export class ScoreColorPipe implements PipeTransform {

  /**
   * Transform quiz lines into a score color class
   * @param quizLines the quiz lines
   * @returns the score color class
   */
  transform(quizLines: QuizLineModel[] | null): 'incorrect' | 'neutral' | 'correct' {
    // Get correct answers number
    const correctAnswersNumber = QuizMakerUtils.getCorrectAnswersNumberFromQuizLines(quizLines) as ZeroToFive;

    // If 0 or 1 correct answers => red
    if(correctAnswersNumber === 0 || correctAnswersNumber === 1) {
      return 'incorrect';
    }

    // If 2 or 3 correct answers => yellow
    if(correctAnswersNumber === 2 || correctAnswersNumber === 3) {
      return 'neutral';
    }

    // Else => green
    return 'correct';
  }

}
