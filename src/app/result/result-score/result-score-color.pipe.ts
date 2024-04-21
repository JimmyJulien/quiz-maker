import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';
import { QuizMakerUtils } from 'src/app/shared/utils/quiz-maker.utils';

/** Pipe used to transform quiz lines into a score color class */
@Pipe({
  name: 'qzmResultScoreColor',
  standalone: true,
})
export class ResultScoreColorPipe implements PipeTransform {

  /**
   * Transform quiz lines into a score color class
   * @param quizLines the quiz lines
   * @returns the score color class
   */
  transform(quizLines: QuizLineModel[] | null): 'incorrect' | 'neutral' | 'correct' {
    // Get correct answers number
    const correctAnswersNumber: number = QuizMakerUtils.getCorrectAnswersNumberFromQuizLines(quizLines);

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
