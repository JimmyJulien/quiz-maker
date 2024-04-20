import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiCategoryModel, ApiCategoryResponseModel } from '../models/api-category.model';
import { QuizzCategoryModel } from '../models/quizz-category.model';

/** Service used to get categories from the Open Trivia Database API */
@Injectable({
  providedIn: 'root'
})
export class QuizzCategoryService {

  readonly #http = inject(HttpClient);

  /**
   * Get categories from Open Trivia Database API
   * @returns the categories
   */
  private getApiCategories(): Observable<ApiCategoryModel[]> {
    return this.#http.get<ApiCategoryResponseModel>('https://opentdb.com/api_category.php')
    .pipe(
      map(apiQuizzCategoryResponse => apiQuizzCategoryResponse.trivia_categories),
    );
  }

  /**
   * Get quizz categories
   * @returns the quizz categories
   */
  getQuizzCategories(): Observable<QuizzCategoryModel[]> {
    // Separator used to identify categories that need formatting
    const separator = ': ';

    return this.getApiCategories()
    .pipe(
      map(categories =>
        categories.map(category => {
          // If category name contains separator, split to get name and subcategory
          if(category.name.includes(separator)) {
            return {
              id: category.id,
              name: category.name.split(separator)[0],
              subcategory: category.name.split(separator)[1]
            }
          }

          // Else use category name and no subcategory
          return {
            id: category.id,
            name: category.name,
            subcategory: null,
          };
        })
      )
    );
  }
}
