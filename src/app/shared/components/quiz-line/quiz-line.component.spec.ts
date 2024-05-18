import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizLineModel } from '../../models/quiz-line.model';
import { QuizLineComponent } from './quiz-line.component';

describe('QuizLineComponent', () => {
  let component: QuizLineComponent;
  let fixture: ComponentFixture<QuizLineComponent>;

  const QUIZ_LINE: QuizLineModel = {
    question: 'Question',
    answers: ['Answer1', 'Answer2', 'Answer3'],
    correctAnswer: 'Answer1',
    userAnswer: null,
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizLineComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('quizLine', signal(QUIZ_LINE));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
