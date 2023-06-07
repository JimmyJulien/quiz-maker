import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiQuizModel } from '../models/api-quiz.model';
import { QuizFormModel } from '../models/quiz-form.model';
import { QuizQuestionModel } from '../models/quiz-question.model';

/** Repository service used to get quiz questions from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class QuizQuestionRepositoryService {

  constructor(private readonly http: HttpClient) {}

  /**
   * Get quiz questions from the Trivia Database API
   * 
   * @param quizConfig the quiz configuration containing the category id and the difficulty value
   * @returns the list of questions from the Trivia Database API
   */
  getQuizQuestions(quizConfig: QuizFormModel): Observable<QuizQuestionModel[]> {
    const API_URL = `https://opentdb.com/api.php?amount=5&category=${quizConfig.category}&difficulty=${quizConfig.difficulty}&type=multiple`;

    return this.http.get<ApiQuizModel>(API_URL)
    .pipe(
      map(apiQuiz => apiQuiz.results
        .map(result => ({
            question: result.question,
            correctAnswer: result.correct_answer,
            incorrectAnswers: result.incorrect_answers,
          })
        )
      )
    );
  }
}
