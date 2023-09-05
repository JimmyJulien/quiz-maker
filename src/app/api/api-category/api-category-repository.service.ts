import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiCategoryModel, ApiCategoryResponseModel } from './api-category.model';

/** Repository service used to get categories from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class ApiCategoryRepositoryService {

  constructor(private readonly http: HttpClient) {}

  /**
   * Get categories from Open Trivia Database API
   * @returns the categories
   */
  getCategories(): Observable<ApiCategoryModel[]> {
    return this.http.get<ApiCategoryResponseModel>('https://opentdb.com/api_category.php')
    .pipe(
      map(apiQuizCategoryResponse => apiQuizCategoryResponse.trivia_categories),
    );
  }
}
