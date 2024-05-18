import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of, tap } from "rxjs";
import { ApiQuestionModel, ApiQuestionResponseModel } from "../models/api-question.model";
import { QuizQuestionService } from "./quiz-question.service";

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>("HttpClient", ["get"]);

  TestBed.configureTestingModule({
    providers: [
      { provide: HttpClient, useValue: httpClientSpy }
    ]
  });

  const service = TestBed.inject(QuizQuestionService);

  return {
    service,
    httpClientSpy
  };
}

describe('QuizQuestionService', () => {
  describe('getApiQuestions', () => {
    it('should return an array of quiz questions', () => {
      const { service, httpClientSpy } = setup();
      const categoryId = 1;
      const difficultyValue = "easy";

      const apiQuestions: ApiQuestionModel[] = [
        {
          category: "Category1",
          type: "multiple",
          difficulty: "easy",
          question: "Question1",
          correct_answer: "Answer1",
          incorrect_answers: ["Answer2", "Answer3"]
        },
        {
          category: "Category1",
          type: "multiple",
          difficulty: "easy",
          question: "Question2",
          correct_answer: "Answer4",
          incorrect_answers: ["Answer5", "Answer6"]
        }
      ];

      const questionResponse: ApiQuestionResponseModel = {
        results: apiQuestions,
        response_code: 200
      };

      httpClientSpy.get.and.returnValue(of(questionResponse));

      service.getApiQuestions(categoryId, difficultyValue)
      .pipe(
        tap(questions => {
          expect(questions).toEqual(apiQuestions);
        })
      )
      .subscribe();
    });
  });
});
