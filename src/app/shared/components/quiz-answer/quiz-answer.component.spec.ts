import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAnswerComponent } from './quiz-answer.component';

describe('QuizAnswerComponent', () => {
  let component: QuizAnswerComponent;
  let fixture: ComponentFixture<QuizAnswerComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizAnswerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('answer', 'Answer');
    fixture.componentRef.setInput('correctAnswer', 'Other Answer');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
