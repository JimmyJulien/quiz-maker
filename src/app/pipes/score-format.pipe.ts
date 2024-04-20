import { Pipe, PipeTransform } from '@angular/core';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { QuizMakerUtils } from '../utils/quiz-maker.utils';

/** Pipe used to transform quiz lines into a formatted score */
@Pipe({
  name: 'qzmScoreFormat',
  standalone: true,
})
export class ScoreFormatPipe implements PipeTransform {

  /**
   * Transform quiz lines into a formatted score
   * @param quizLines the quiz lines
   * @returns the formatted score
   */
  transform(quizLines: QuizLineModel[] | null): string {
    if(!quizLines) return '';// TODO JJN
    return `You scored ${QuizMakerUtils.getCorrectAnswersNumberFromQuizLines(quizLines)} out of ${quizLines.length}`;
  }

}
