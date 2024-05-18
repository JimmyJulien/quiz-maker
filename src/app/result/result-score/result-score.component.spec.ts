import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { QuizLineModel } from "src/app/shared/models/quiz-line.model";
import { ResultScoreComponent } from "./result-score.component";

function setup(nbOfGoodAnswers: number) {
  let component: ResultScoreComponent;
  let fixture: ComponentFixture<ResultScoreComponent>;

  fixture = TestBed.createComponent(ResultScoreComponent);
  component = fixture.componentInstance;

  const quizLines: QuizLineModel[] = [];

  // Add good answers
  for (let i = 0; i < nbOfGoodAnswers; i++) {
    quizLines.push({
      question: "Question",
      answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
      correctAnswer: "Answer1",
      userAnswer: "Answer1",
    });
  }

  // Complete with bad answers
  for (let i = 0; i < 5 - nbOfGoodAnswers; i++) {
    quizLines.push({
      question: "Question",
      answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
      correctAnswer: "Answer1",
      userAnswer: "Answer2",
    });
  }

  fixture.componentRef.setInput("quizLines", quizLines);
  fixture.detectChanges();

  return { component, fixture };
}

describe('ResultScoreComponent', () => {
  it('should be You scored 0 out of 5 with a incorrect class if 0 correct answers', () => {
    const { fixture } = setup(0);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 0 out of 5");
    expect(score.nativeElement.classList).toContain("incorrect");
  });

  it('should be You scored 1 out of 5 with a incorrect class if 1 correct answers', () => {
    const { fixture } = setup(1);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 1 out of 5");
    expect(score.nativeElement.classList).toContain("incorrect");
  });

  it('should be You scored 2 out of 5 with a neutral class if 2 correct answers', () => {
    const { fixture } = setup(2);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 2 out of 5");
    expect(score.nativeElement.classList).toContain("neutral");
  });

  it('should be You scored 3 out of 5 with a neutral class if 3 correct answers', () => {
    const { fixture } = setup(3);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 3 out of 5");
    expect(score.nativeElement.classList).toContain("neutral");
  });

  it('should be You scored 4 out of 5 with a correct class if 4 correct answers', () => {
    const quizLinesWithOneCorrectAnswer = [
      {
        question: "Question",
        answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
        correctAnswer: "Answer1",
        userAnswer: "Answer1",
      },
      {
        question: "Question",
        answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
        correctAnswer: "Answer3",
        userAnswer: "Answer3",
      },
      {
        question: "Question",
        answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
        correctAnswer: "Answer2",
        userAnswer: "Answer2",
      },
      {
        question: "Question",
        answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
        correctAnswer: "Answer3",
        userAnswer: "Answer3",
      },
      {
        question: "Question",
        answers: ["Answer1", "Answer2", "Answer3", "Answer4"],
        correctAnswer: "Answer1",
        userAnswer: "Answer4",
      }
    ];

    const { fixture } = setup(4);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 4 out of 5");
    expect(score.nativeElement.classList).toContain("correct");
  });

  it('should be You scored 5 out of 5 with a correct class if 5 correct answers', () => {
    const { fixture } = setup(5);
    
    const score = fixture.debugElement.query(By.css('[data-testid="score"]'));

    expect(score.nativeElement.innerText).toBe("You scored 5 out of 5");
    expect(score.nativeElement.classList).toContain("correct");
  });
});
