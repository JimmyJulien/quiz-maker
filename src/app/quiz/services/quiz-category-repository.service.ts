import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiQuizCategoryModel } from '../models/api-quiz-category.model';
import { QuizCategoryModel } from '../models/quiz-category.model';

/** Repository service used to get quiz categories from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class QuizCategoryRepositoryService {

  constructor(private readonly http: HttpClient) {}

  /**
   * Get quiz categories from Open Trivia Database API
   * @returns the quiz categories
   */
  getQuizCategories(): Observable<QuizCategoryModel[]> {
    return this.http.get<ApiQuizCategoryModel>('https://opentdb.com/api_category.php')
    .pipe(
      map(apiCategory => apiCategory.trivia_categories)
    );
  }
}
