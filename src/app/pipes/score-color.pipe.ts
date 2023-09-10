import { Pipe, PipeTransform } from '@angular/core';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { QuizzMakerUtils } from 'src/app/utils/quizz-maker.utils';
import { ZeroToFive } from '../types/zero-to-five.type';

/** Pipe used to transform quizz lines into a score color class */
@Pipe({
  name: 'qzmScoreColor',
  standalone: true,
})
export class ScoreColorPipe implements PipeTransform {

  /**
   * Transform quizz lines into a score color class
   * @param quizLines the quizz lines
   * @returns the score color class
   */
  transform(quizLines: QuizzLineModel[] | null): 'incorrect' | 'neutral' | 'correct' {
    // Get correct answers number
    const correctAnswersNumber = QuizzMakerUtils.getCorrectAnswersNumberFromQuizzLines(quizLines) as ZeroToFive;

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
