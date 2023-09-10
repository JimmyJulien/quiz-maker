/** Quizz line model */
export interface QuizzLineModel {
  question: string;
  answers: string[];
  correctAnswer: string;
  userAnswer: string | null;
}