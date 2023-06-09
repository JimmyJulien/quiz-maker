import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuizCategoryModel } from 'src/app/shared/models/quiz-category.model';
import { QuizConfigModel } from 'src/app/shared/models/quiz-config.model';
import { QuizDifficultyModel } from 'src/app/shared/models/quiz-difficulty.model';

@Component({
  selector: 'qzm-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizFormComponent {

  readonly CATEGORY_FIELD = 'category';
  readonly DIFFICULTY_FIELD = 'difficulty';

  /** Quiz categories loading indicator from the parent */
  @Input() areQuizCategoriesLoading: boolean | null = false;

  /** Quiz categories from the parent */
  @Input() quizCategories: QuizCategoryModel[] | null = [];
  
  /** Quiz difficulties from the parent */
  @Input() quizDifficulties: QuizDifficultyModel[] = [];

  /** Create quiz event emitter to the parent*/
  @Output() createQuiz = new EventEmitter<QuizConfigModel>();

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
    this.createQuiz.emit(this.form.value as QuizConfigModel);
  }
}
