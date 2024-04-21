/** Question model from the Open Trivia Database API */
export interface ApiQuestionModel {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

/** Question model from the Open Trivia Database API */
export interface ApiQuestionResponseModel {
  response_code: number;
  results: ApiQuestionModel[];
}