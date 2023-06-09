import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiQuestionModel, ApiQuestionResponseModel } from './api-question.model';

/** Repository service used to get questions from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class ApiQuestionRepositoryService {

  constructor(private readonly http: HttpClient) {}

  /**
   * Get questions from the Trivia Database API
   * 
   * @param categoryId the category id used to select the questions
   * @param difficultyValue the difficulty value used to select the questions
   * @returns the list of questions from the Trivia Database API
   */
  getQuestions(categoryId: number, difficultyValue: string): Observable<ApiQuestionModel[]> {
    return this.http.get<ApiQuestionResponseModel>(
      `https://opentdb.com/api.php?amount=5&category=${categoryId}&difficulty=${difficultyValue}&type=multiple`
    )
    .pipe(
      map(apiQuizQuestionResponse => apiQuizQuestionResponse.results)
    );
  }
}
