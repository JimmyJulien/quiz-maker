import { QuizzLineModel } from "../models/quizz-line.model";

/** Quizz Maker utility class */
export class QuizzMakerUtils {

  // Private constructor because static class
  private constructor() {}

  /**
   * Shuffle answers passed in parameters
   * @param answers the answers to shuffle
   * @returns the shuffled answers
   */
  static shuffleAnswers(answers: string[]): string[] {
    return answers
      .map(answer => ({ value: answer, sortValue: Math.random()}))
      .sort((answer1, answer2) => answer1.sortValue - answer2.sortValue)
      .map(({value}) => value);
  }

  /**
   * Get the correct answers number from the quizz lines passed in parameters
   * @param quizLines the quizz lines
   * @returns the number of correct answers in the quizz lines
   */
  static getCorrectAnswersNumberFromQuizzLines(quizLines: QuizzLineModel[] | null): number {
    if(!quizLines) return 0;
    return quizLines
    .filter(quizLine => quizLine.userAnswer === quizLine.correctAnswer)
    .length;
  }
}