import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuizAnswerModel } from 'src/app/quiz/models/quiz-answer.model';
import { QuizLineModel } from 'src/app/quiz/models/quiz-line.model';

@Component({
  selector: 'qzm-quiz-maker-questions',
  templateUrl: './quiz-maker-questions.component.html',
  styleUrls: ['./quiz-maker-questions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizMakerQuestionsComponent {
  
  /** Quiz lines loading indicator from the parent */
  @Input() areQuizLinesLoading: boolean | null = false;

  /** Quiz lines from the parent */
  @Input() quizLines: QuizLineModel[] | null = [];

  /** Quiz complete indicator from the parent */
  @Input() isQuizComplete: boolean | null = false;

  /** Pick answer event emitter to the parent */
  @Output() pickAnswer = new EventEmitter<QuizAnswerModel>();

  /** Submit event emitter to the parent */
  @Output() submit = new EventEmitter<void>();

  /**
   * Emit a pick answer event to the parent
   * @param answer the answer to emit
   * @param question the question to emit
   */
  pickAnswerForQuestion(answer: string, question: string) {
    this.pickAnswer.emit({ answer, question });
  }

  /**
   * Emit a submit event to the parent
   */
  onSubmit() {
    this.submit.emit();
  }
}
