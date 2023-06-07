import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from '../models/quiz-line.model';
import { QuizUtils } from '../utils/quiz.utils';

/** Pipe used to transform quiz lines into a formatted score */
@Pipe({
  name: 'qzmScoreFormat'
})
export class ScoreFormatPipe implements PipeTransform {

  /**
   * Transform quiz lines into a formatted score
   * @param quizLines the quiz lines
   * @returns the formatted score
   */
  transform(quizLines: QuizLineModel[]): string {
    return `You scored ${QuizUtils.getCorrectAnswersNumberFromQuizLines(quizLines)} out of ${quizLines.length}`;
  }

}
