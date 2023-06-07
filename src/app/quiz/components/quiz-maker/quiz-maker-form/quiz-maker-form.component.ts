import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuizConstants } from 'src/app/quiz/constants/quiz.constants';
import { QuizCategoryModel } from 'src/app/quiz/models/quiz-category.model';
import { QuizDifficultyModel } from 'src/app/quiz/models/quiz-difficulty.model';
import { QuizFormModel } from 'src/app/quiz/models/quiz-form.model';

@Component({
  selector: 'qzm-quiz-maker-form',
  templateUrl: './quiz-maker-form.component.html',
  styleUrls: ['./quiz-maker-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizMakerFormComponent {

  readonly CATEGORY_FIELD = QuizConstants.CATEGORY_FIELD;
  readonly DIFFICULTY_FIELD = QuizConstants.DIFFICULTY_FIELD;

  /** Quiz categories loading indicator from the parent */
  @Input() areQuizCategoriesLoading: boolean | null = false;

  /** Quiz categories from the parent */
  @Input() quizCategories: QuizCategoryModel[] | null = [];
  
  /** Quiz difficulties from the parent */
  @Input() quizDifficulties: QuizDifficultyModel[] = [];

  /** Create quiz event emitter to the parent*/
  @Output() createQuiz = new EventEmitter<QuizFormModel>();

  /** Quiz form */
  form = new FormGroup({
    category: new FormControl(null, Validators.required),
    difficulty: new FormControl(null, Validators.required),
  });

  /** Category control getter */
  get categoryControl(): FormControl {
    return this.form.get(this.CATEGORY_FIELD) as FormControl;
  }

  /** Difficulty control getter */
  get difficultyControl(): FormControl {
    return this.form.get(this.DIFFICULTY_FIELD) as FormControl;
  }

  /**
   * Submit event emitting a create quiz event to te parent
   */
  onSubmit() {
    this.createQuiz.emit(this.form.value as QuizFormModel);
  }
}
