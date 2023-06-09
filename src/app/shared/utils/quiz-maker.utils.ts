import { QuizLineModel } from "../models/quiz-line.model";

/** Quiz Maker utility class */
export class QuizMakerUtils {

  // Private constructor because static class
  private constructor() {}

  /**
   * Get the correct answers number from the quiz lines passed in parameters
   * @param quizLines the quiz lines
   * @returns the number of correct answers in the quiz lines
   */
  static getCorrectAnswersNumberFromQuizLines(quizLines: QuizLineModel[]): number {
    return quizLines
    .filter(quizLine => quizLine.userAnswer === quizLine.correctAnswer)
    .length;
  }
}