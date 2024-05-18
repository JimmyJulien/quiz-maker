import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of, tap } from "rxjs";
import { ApiCategoryModel, ApiCategoryResponseModel } from "../models/api-category.model";
import { QuizCategoryModel } from "../models/quiz-category.model";
import { QuizCategoryService } from "./quiz-category.service";

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>("HttpClient", ["get"]);

  TestBed.configureTestingModule({
    providers: [
      {provide: HttpClient, useValue: httpClientSpy}
    ]
  });

  const quizCategoryService = TestBed.inject(QuizCategoryService);

  return {
    quizCategoryService,
    httpClientSpy
  };
}

describe('QuizCategoryService', () => {
  describe('getQuizCategories', () => {
    it('should return an array of quiz categories', () => {
      const { quizCategoryService, httpClientSpy } = setup();

      const apiCategories:ApiCategoryModel[] = [
        {
          id: 1,
          name: 'Category1'
        },
        {
          id: 2,
          name: 'Category2'
        },
        {
          id: 3,
          name: 'Category3: Subcategory1'
        }
      ];

      const categoryResponse: ApiCategoryResponseModel = {
        trivia_categories: apiCategories
      };

      const expectedCategories: QuizCategoryModel[] = [
        {
          id: 1,
          name: 'Category1',
          subcategory: null
        },
        {
          id: 2,
          name: 'Category2',
          subcategory: null
        },
        {
          id: 3,
          name: 'Category3',
          subcategory: 'Subcategory1'
        }
      ];

      httpClientSpy.get.and.returnValue(of(categoryResponse));

      quizCategoryService.getQuizCategories()
      .pipe(
        tap(categories => {
          expect(categories).toEqual(expectedCategories);
        })
      )
      .subscribe();
    });
  });
});