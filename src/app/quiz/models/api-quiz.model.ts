/** Quiz question model of the Open Trivia Database API */
export interface ApiQuizQuestionModel {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

/** Quiz model of the Open Trivia Database API */
export interface ApiQuizModel {
  response_code: number;
  results: ApiQuizQuestionModel[];
}