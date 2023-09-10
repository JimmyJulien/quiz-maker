import { Pipe, PipeTransform } from '@angular/core';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { QuizzMakerUtils } from '../utils/quizz-maker.utils';

/** Pipe used to transform quizz lines into a formatted score */
@Pipe({
  name: 'qzmScoreFormat',
  standalone: true,
})
export class ScoreFormatPipe implements PipeTransform {

  /**
   * Transform quizz lines into a formatted score
   * @param quizLines the quizz lines
   * @returns the formatted score
   */
  transform(quizLines: QuizzLineModel[] | null): string {
    if(!quizLines) return '';// TODO JJN
    return `You scored ${QuizzMakerUtils.getCorrectAnswersNumberFromQuizzLines(quizLines)} out of ${quizLines.length}`;
  }

}
