import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, SimpleChanges, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { QuizConfigModel } from 'src/app/models/quiz-config.model';
import { QuizDifficultyModel } from 'src/app/models/quiz-difficulty.model';
import { existingValidator } from '../../validators/existing.validator';
import { QuizInputComponent } from '../quiz-input/quiz-input.component';
import { QuizSelectComponent } from '../quiz-select/quiz-select.component';

// TODO update form
@Component({
  selector: 'qzm-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrl: './quiz-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QuizInputComponent,
    QuizSelectComponent,
  ],
})
export class QuizFormComponent implements OnInit, OnDestroy {

  readonly CATEGORY_FIELD = 'category';
  readonly SUBCATEGORY_FIELD = 'subcategory';
  readonly DIFFICULTY_FIELD = 'difficulty';

  /** Quiz categories loading indicator from the parent */
  areQuizCategoriesLoading = input<boolean | null>(false);

  /** Quiz categories from the parent */
  quizCategories = input<string[]>([]);
  
  /** Quiz subcategories from the parent */
  quizSubcategories = input<string[]>([]);

  /** Quiz difficulties loading indicator from the parent */
  areQuizDifficultiesLoading = input<boolean>(false);

  /** Quiz difficulties from the parent */
  quizDifficulties = input<QuizDifficultyModel[]>([]);

  /** Select a category */
  selectCategory = output<string>();

  /** Create quiz event emitter to the parent*/
  createQuiz = output<QuizConfigModel>();

  /** Quiz form */
  form!: FormGroup;

  /** Category control getter */
  get categoryControl(): FormControl<string | null> {
    return this.form.get(this.CATEGORY_FIELD) as FormControl;
  }

  /** Subcategory control getter */
  get subcategoryControl(): FormControl<string | null> {
    return this.form.get(this.SUBCATEGORY_FIELD) as FormControl;
  }

  /** Difficulty control getter */
  get difficultyControl(): FormControl<QuizDifficultyModel> {
    return this.form.get(this.DIFFICULTY_FIELD) as FormControl;
  }

  /** Quiz difficulty formatting function used by quiz-select */
  formatQuizDifficultyFn = (value: QuizDifficultyModel | null) => value?.label || null;
  
  /** Main subscription used to handle unsubscription on component destruction */
  subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    // Handle first call before ngOnOnInit (form not yet initialized)
    if(!this.form) return;

    // Update category validators (here because not an async validator)
    const quizCategories = changes['quizCategories'];
    
    if(quizCategories?.currentValue?.length) {
      this.categoryControl.addValidators(
        existingValidator(quizCategories.currentValue)
      );
    }

    // Update subcategory control
    const quizSubcategories = changes['quizSubcategories'];

    if(quizSubcategories?.currentValue?.length) {
      this.form.addControl(
        this.SUBCATEGORY_FIELD,
        new FormControl(null, [Validators.required, existingValidator(quizSubcategories.currentValue)])
      );
    }
    else {
      this.form.removeControl(this.SUBCATEGORY_FIELD);
    }
  }
  
  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Initialize the quiz form and its controls
   */
  private initializeForm(): void {
    // Initialize form
    this.form = new FormGroup({
      [this.CATEGORY_FIELD]: new FormControl(null, Validators.required),
      [this.DIFFICULTY_FIELD]: new FormControl(null, Validators.required)
    });

    // Update category and subcategory when category change
    this.subscription.add(
      this.categoryControl.valueChanges
      .pipe(
        tap(category => {
          // Emit selected category
          this.selectCategory.emit(category!);

          // Reset subcategory (if existing)
          this.subcategoryControl?.reset();
        })
      )
      .subscribe()
    );
  }

  /**
   * Submit event emitting a create quiz event to te parent
   */
  onSubmit() {
    this.createQuiz.emit({
      category: this.categoryControl.value,
      subcategory: this.subcategoryControl?.value,
      difficulty: this.difficultyControl.value.value
    });
  }
}
