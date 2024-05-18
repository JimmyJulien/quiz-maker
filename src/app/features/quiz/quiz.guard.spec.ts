import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { QuizMakerService } from "src/app/shared/services/quiz-maker.service";
import { quizGuard } from "./quiz.guard";

function setup() {
  const quizMakerServiceSpy = jasmine.createSpyObj<QuizMakerService>("QuizMakerService", ["getQuizLines"]);
  const routerSpy = jasmine.createSpyObj<Router>("Router", ["parseUrl"]);

  const guard = () => {
    TestBed.configureTestingModule({
      providers: [
        quizGuard,
        { provide: QuizMakerService, useValue: quizMakerServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    return TestBed.runInInjectionContext(quizGuard);
  };

  return {
    guard,
    quizMakerServiceSpy,
    routerSpy
  };
}

describe("quizGuard", () => {
  it("should return true if quiz lines are defined", () => {
    const { guard, quizMakerServiceSpy } = setup();

    quizMakerServiceSpy.getQuizLines.and.returnValue(signal([
      { question: "Question", answers: ["Answer1"], correctAnswer: "Answer1", userAnswer: null }
    ]));

    const result = guard();

    expect(result).toBe(true);
  });

  it("should redirect to home if quiz lines are not defined", () => {
    const { guard, quizMakerServiceSpy, routerSpy } = setup();

    quizMakerServiceSpy.getQuizLines.and.returnValue(signal([]));

    const result = guard();

    expect(result).not.toBe(true);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith("/home");
  });
});