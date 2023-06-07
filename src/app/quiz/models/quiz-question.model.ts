/** Quiz question model */
export interface QuizQuestionModel {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}