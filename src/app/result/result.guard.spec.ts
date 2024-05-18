import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { QuizMakerService } from "../shared/services/quiz-maker.service";
import { resultGuard } from "./result.guard";

function setup() {
  const quizMakerServiceSpy = jasmine.createSpyObj<QuizMakerService>("QuizMakerService", ["isQuizComplete"]);
  const routerSpy = jasmine.createSpyObj<Router>("Router", ["parseUrl"]);

  const guard = () => {
    TestBed.configureTestingModule({
      providers: [
        resultGuard,
        { provide: QuizMakerService, useValue: quizMakerServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    return TestBed.runInInjectionContext(resultGuard);
  };

  return {
    guard,
    quizMakerServiceSpy,
    routerSpy
  };
}

describe("resultGuard", () => {
  it("should return true if quiz is complete", () => {
    const { guard, quizMakerServiceSpy } = setup();

    quizMakerServiceSpy.isQuizComplete.and.returnValue(signal(true));

    const result = guard();

    expect(result).toBe(true);
  });

  it("should redirect to home if quiz is not complete", () => {
    const { guard, quizMakerServiceSpy, routerSpy } = setup();

    quizMakerServiceSpy.isQuizComplete.and.returnValue(signal(false));

    const result = guard();

    expect(result).not.toBe(true);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith("/home");
  });
});
