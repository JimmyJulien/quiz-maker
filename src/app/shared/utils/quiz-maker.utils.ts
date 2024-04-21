import { QuizLineModel } from "../models/quiz-line.model";

/** Quiz Maker utility class */
export class QuizMakerUtils {

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
   * Get the correct answers number from the quiz lines passed in parameters
   * @param quizLines the quiz lines
   * @returns the number of correct answers in the quiz lines
   */
  static getCorrectAnswersNumberFromQuizLines(quizLines: QuizLineModel[] | null): number {
    if(!quizLines) return 0;
    return quizLines
    .filter(quizLine => quizLine.userAnswer === quizLine.correctAnswer)
    .length;
  }
}