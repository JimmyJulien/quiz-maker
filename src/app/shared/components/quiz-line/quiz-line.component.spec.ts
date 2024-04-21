import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizLineComponent } from './quiz-line.component';

describe('QuizLineComponent', () => {
  let component: QuizLineComponent;
  let fixture: ComponentFixture<QuizLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuizLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
