import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiQuestionModel, ApiQuestionResponseModel } from '../models/api-question.model';

/** Service used to get questions from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class QuizQuestionService {

  readonly #http = inject(HttpClient);

  /**
   * Get questions from the Trivia Database API
   * 
   * @param categoryId the category id used to select the questions
   * @param difficultyValue the difficulty value used to select the questions
   * @returns the list of questions from the Trivia Database API
   */
  getApiQuestions(categoryId: number, difficultyValue: string, numberOfQuestions = 5): Observable<ApiQuestionModel[]> {
    // API doesn't support less than 1 question and more than 100
    if(numberOfQuestions < 1 || numberOfQuestions > 100) {
      throw new Error('Open Trivia API can only provide between 1 and 100 questions at a time');
    }

    return this.#http.get<ApiQuestionResponseModel>(
      `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${categoryId}&difficulty=${difficultyValue}&type=multiple`
    )
    .pipe(
      map(apiQuizQuestionResponse => apiQuizQuestionResponse.results)
    );
  }
}
