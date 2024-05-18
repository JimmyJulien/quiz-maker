import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { ApiQuestionModel } from "src/app/shared/models/api-question.model";
import { QuizAnswerModel } from "src/app/shared/models/quiz-answer.model";
import { QuizLineModel } from "src/app/shared/models/quiz-line.model";
import { QuizMakerService } from "src/app/shared/services/quiz-maker.service";
import { QuizComponent } from "./quiz.component";

type SetupConfig = {
  isQuizMakerKo?: boolean,
  areQuizLinesLoading?: boolean,
  isQuizComplete?: boolean,
  canQuestionBeChanged?: boolean,
};

function setup(config?: SetupConfig) {
  const QUIZ_LINES: QuizLineModel[] = [
    {
      question: 'Question 1',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 3',
      userAnswer: config?.isQuizComplete ? 'Answer 1' : null,
    },
    {
      question: 'Question 2',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 1',
      userAnswer: config?.isQuizComplete ? 'Answer 1' : null,
    },
    {
      question: 'Question 3',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 1',
      userAnswer: config?.isQuizComplete ? 'Answer 1' : null,
    },
    {
      question: 'Question 4',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 1',
      userAnswer: config?.isQuizComplete ? 'Answer 1' : null,
    },
    {
      question: 'Question 5',
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 2',
      userAnswer: config?.isQuizComplete ? 'Answer 1' : null,
    }
  ];

  const quizMakerServiceSpy = jasmine.createSpyObj<QuizMakerService>(
    'QuizMakerService',
    [
      'areQuizLinesLoading',
      'canQuestionBeChanged',
      'changeQuizLine',
      'getQuizLines',
      'isQuizComplete',
      'isQuizMakerKo',
      'pickAnswer',
      'reloadQuiz',
      'showQuizResults',
    ]
  );

  TestBed.configureTestingModule({
    providers: [
      { provide: QuizMakerService, useValue: quizMakerServiceSpy }
    ]
  });

  quizMakerServiceSpy.areQuizLinesLoading.and.returnValue(signal(config?.areQuizLinesLoading || false));
  quizMakerServiceSpy.canQuestionBeChanged.and.returnValue(signal(config?.canQuestionBeChanged || true));
  quizMakerServiceSpy.getQuizLines.and.returnValue(signal(QUIZ_LINES));
  quizMakerServiceSpy.isQuizComplete.and.returnValue(signal(config?.isQuizComplete || false));
  quizMakerServiceSpy.isQuizMakerKo.and.returnValue(signal(config?.isQuizMakerKo || false));

  const fixture = TestBed.createComponent(QuizComponent);
  const component = fixture.componentInstance;
  const debugElement = fixture.debugElement;

  fixture.detectChanges();

  return {
    QUIZ_LINES,
    debugElement,
    component,
    fixture,
    quizMakerServiceSpy,
  };
}

describe('QuizComponent', () => {
  it('should display unexpected error with reload button when quiz maker KO', () => {
    const { debugElement } = setup({isQuizMakerKo: true});

    const unexpectedErrorDebugElement = debugElement.query(By.css('[data-testid="unexpected-error"]'));
    const reloadButtonDebugElement = debugElement.query(By.css('[data-testid="reload-button"]'));
    const loadingDebugElement = debugElement.query(By.css('[data-testid="loading"]'));
    const quizLinesDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    const submitButtonDebugElement = debugElement.query(By.css('[data-testid="submit-button"]'));

    expect(unexpectedErrorDebugElement).toBeDefined();
    expect(reloadButtonDebugElement).toBeDefined();
    expect(loadingDebugElement).toBeNull();
    expect(quizLinesDebugElement).toBeNull();
    expect(submitButtonDebugElement).toBeNull();
  });

  it('should reload the page when reload button is clicked', () => {
    const { debugElement, quizMakerServiceSpy } = setup({isQuizMakerKo: true});

    const reloadButtonDebugElement = debugElement.query(By.css('[data-testid="reload-button"]'));
    reloadButtonDebugElement.triggerEventHandler('click');

    expect(quizMakerServiceSpy.reloadQuiz).toHaveBeenCalledTimes(1);
  });

  it('should display loading when quiz lines are loading', () => {
    const { debugElement } = setup({ areQuizLinesLoading: true });

    const unexpectedErrorDebugElement = debugElement.query(By.css('[data-testid="unexpected-error"]'));
    const reloadButtonDebugElement = debugElement.query(By.css('[data-testid="reload-button"]'));
    const loadingDebugElement = debugElement.query(By.css('[data-testid="loading"]'));
    const quizLinesDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    const submitButtonDebugElement = debugElement.query(By.css('[data-testid="submit-button"]'));

    expect(unexpectedErrorDebugElement).toBeNull();
    expect(reloadButtonDebugElement).toBeNull();
    expect(loadingDebugElement).toBeDefined();
    expect(quizLinesDebugElement).toBeNull();
    expect(submitButtonDebugElement).toBeNull();
  });

  it('should display quiz lines when quiz lines are loaded but quiz is not complete', () => {
    const { debugElement } = setup();

    const unexpectedErrorDebugElement = debugElement.query(By.css('[data-testid="unexpected-error"]'));
    const reloadButtonDebugElement = debugElement.query(By.css('[data-testid="reload-button"]'));
    const loadingDebugElement = debugElement.query(By.css('[data-testid="loading"]'));
    const quizLinesDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    const submitButtonDebugElement = debugElement.query(By.css('[data-testid="submit-button"]'));

    expect(unexpectedErrorDebugElement).toBeNull();
    expect(reloadButtonDebugElement).toBeNull();
    expect(loadingDebugElement).toBeNull();
    expect(quizLinesDebugElement).toBeDefined();
    expect(submitButtonDebugElement).toBeNull();
  });

  it('should change line when change button of a line is clicked', () => {
    const { QUIZ_LINES, debugElement, quizMakerServiceSpy } = setup();

    quizMakerServiceSpy.changeQuizLine.and.returnValue(of({} as ApiQuestionModel));

    const firstQuizLineDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    firstQuizLineDebugElement.triggerEventHandler('changeQuizLine');

    expect(quizMakerServiceSpy.changeQuizLine).toHaveBeenCalledOnceWith(QUIZ_LINES[0]);
  });


  it('should pick an answer when an answer of a line is clicked', () => {
    const { QUIZ_LINES, debugElement, quizMakerServiceSpy } = setup();

    const answer: QuizAnswerModel = {
      question: QUIZ_LINES[0].question,
      answer: QUIZ_LINES[0].answers[0],
    };

    const firstQuizLineDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    firstQuizLineDebugElement.triggerEventHandler('pickAnswer', answer);

    expect(quizMakerServiceSpy.pickAnswer).toHaveBeenCalledOnceWith(answer);
  });

  it('should display quiz lines and submit button when quiz lines are loaded and quiz is complete', () => {
    const { debugElement } = setup({ isQuizComplete: true });

    const unexpectedErrorDebugElement = debugElement.query(By.css('[data-testid="unexpected-error"]'));
    const reloadButtonDebugElement = debugElement.query(By.css('[data-testid="reload-button"]'));
    const loadingDebugElement = debugElement.query(By.css('[data-testid="loading"]'));
    const quizLinesDebugElement = debugElement.query(By.css('[data-testid="line"]'));
    const submitButtonDebugElement = debugElement.query(By.css('[data-testid="submit-button"]'));

    expect(unexpectedErrorDebugElement).toBeNull();
    expect(reloadButtonDebugElement).toBeNull();
    expect(loadingDebugElement).toBeNull();
    expect(quizLinesDebugElement).toBeDefined();
    expect(submitButtonDebugElement).toBeDefined();
  });

  it('should show results when submit button is clicked', () => {
    const { debugElement, quizMakerServiceSpy } = setup({ isQuizComplete: true });

    const submitButtonDebugElement = debugElement.query(By.css('[data-testid="submit-button"]'));
    submitButtonDebugElement.triggerEventHandler('click');

    expect(quizMakerServiceSpy.showQuizResults).toHaveBeenCalledTimes(1);
  });
});