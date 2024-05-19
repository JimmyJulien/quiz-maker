import { TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { QuizLineModel } from '../../shared/models/quiz-line.model';
import { QuizMakerService } from '../../shared/services/quiz-maker.service';
import { ResultComponent } from './result.component';

function setup() {
  const QUIZ_LINES: QuizLineModel[] = [
    {
      question: 'Question1',
      answers: ['Answer1', 'Answer2', 'Answer3', 'Answer4'],
      correctAnswer: 'Answer1',
      userAnswer: 'Answer1',
    },
    {
      question: 'Question2',
      answers: ['Answer1', 'Answer2', 'Answer3', 'Answer4'],
      correctAnswer: 'Answer4',
      userAnswer: 'Answer1',
    },
    {
      question: 'Question2',
      answers: ['Answer1', 'Answer2', 'Answer3', 'Answer4'],
      correctAnswer: 'Answer4',
      userAnswer: 'Answer1',
    },
    {
      question: 'Question2',
      answers: ['Answer1', 'Answer2', 'Answer3', 'Answer4'],
      correctAnswer: 'Answer4',
      userAnswer: 'Answer1',
    },
    {
      question: 'Question2',
      answers: ['Answer1', 'Answer2', 'Answer3', 'Answer4'],
      correctAnswer: 'Answer4',
      userAnswer: 'Answer1',
    },
  ];

  const quizMakerServiceSpy = jasmine.createSpyObj<QuizMakerService>(
    'QuizMakerService', ['createNewQuiz', 'getQuizLines']
  );

  TestBed.configureTestingModule({
    providers: [
      { provide: QuizMakerService, useValue: quizMakerServiceSpy }
    ]
  });

  quizMakerServiceSpy.getQuizLines.and.returnValue(signal(QUIZ_LINES));

  const fixture = TestBed.createComponent(ResultComponent);
  const component = fixture.componentInstance;
  const debugElement = fixture.debugElement;

  fixture.detectChanges();

  return { QUIZ_LINES, component, fixture, debugElement, quizMakerServiceSpy };
}

describe('ResultComponent', () => {
  it('should initialize with 5 disabled quiz lines', () => {
    const { QUIZ_LINES, debugElement } = setup();

    const quizLineDebugElements = debugElement.queryAll(By.css('[data-testid="line"]'));
    const areAllLinesDisabled = quizLineDebugElements.every(quizLineDebugElement => quizLineDebugElement.componentInstance.disabled);

    expect(quizLineDebugElements.length).toBe(QUIZ_LINES.length);
    expect(areAllLinesDisabled).toBe(true);
  });

  it('should initialize with a score', () => {
    const { debugElement } = setup();

    const scoreDebugElement = debugElement.query(By.css('[data-testid="score"]'));

    expect(scoreDebugElement).toBeDefined();
  });

  it('should initialize with a new quiz button', () => {
    const { debugElement } = setup();

    const newQuizButtonDebugElement = debugElement.query(By.css('[data-testid="new-quiz-button"]'));

    expect(newQuizButtonDebugElement).toBeDefined();
  });

  it('should create a new quiz when the new quiz button is clicked', () => {
    const { debugElement, quizMakerServiceSpy } = setup();

    const newQuizButtonDebugElement = debugElement.query(By.css('[data-testid="new-quiz-button"]'));
    newQuizButtonDebugElement.triggerEventHandler('click');

    expect(quizMakerServiceSpy.createNewQuiz).toHaveBeenCalledTimes(1);
  });
});
