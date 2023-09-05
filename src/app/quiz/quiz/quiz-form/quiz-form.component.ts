import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { QuizConfigModel } from 'src/app/shared/models/quiz-config.model';
import { QuizDifficultyModel } from 'src/app/shared/models/quiz-difficulty.model';
import { existingValidator } from '../../../shared/validators/existing.validator';

@Component({
  selector: 'qzm-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizFormComponent implements OnInit, OnDestroy {

  readonly CATEGORY_FIELD = 'category';
  readonly SUBCATEGORY_FIELD = 'subcategory';
  readonly DIFFICULTY_FIELD = 'difficulty';

  /** Quiz categories loading indicator from the parent */
  @Input() areQuizCategoriesLoading: boolean | null = false;

  /** Quiz categories from the parent */
  @Input() quizCategories: string[] | null = [];
  
  /** Quiz subcategories from the parent */
  @Input() quizSubcategories: string[] | null = [];

  /** Quiz difficulties from the parent */
  @Input() quizDifficulties: QuizDifficultyModel[] = [];

  /** Select a category */
  @Output() selectCategory = new EventEmitter<string>();

  /** Create quiz event emitter to the parent*/
  @Output() createQuiz = new EventEmitter<QuizConfigModel>();

  /** Quiz form */
  form!: FormGroup;

  /** Category control getter */
  get categoryControl(): FormControl {
    return this.form.get(this.CATEGORY_FIELD) as FormControl;
  }

  /** Subcategory control getter */
  get subcategoryControl(): FormControl {
    return this.form.get(this.SUBCATEGORY_FIELD) as FormControl;
  }

  /** Difficulty control getter */
  get difficultyControl(): FormControl {
    return this.form.get(this.DIFFICULTY_FIELD) as FormControl;
  }

  
  /** Main subscription used to handle unsubscription on component destruction */
  subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    // Handle first call before ngOnOnInit (form not yet initialized)
    if(!this.form) return;

    // Update category validators
    const quizCategories = changes['quizCategories'];
    if(quizCategories?.currentValue?.length) {
      this.categoryControl.addValidators(
        existingValidator(quizCategories.currentValue)
      );
    }

    // Update subcategories validators
    const quizSubcategories = changes['quizSubcategories'];

    if(quizSubcategories?.currentValue?.length) {
      this.subcategoryControl.addValidators([
        Validators.required,
        existingValidator(quizSubcategories.currentValue)
      ]);
    }
    else {
      this.subcategoryControl.removeValidators([
        Validators.required,
        existingValidator(quizSubcategories.currentValue)
      ]);
    }

    // Update form validity
    this.form.updateValueAndValidity();
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
      [this.SUBCATEGORY_FIELD]: new FormControl(null),
      [this.DIFFICULTY_FIELD]: new FormControl(null, Validators.required)
    });

    // Update category and subcategory when catagory change
    this.subscription.add(
      this.categoryControl.valueChanges
      .pipe(
        tap(category => {
          // Emit selected category
          this.selectCategory.emit(category);

          // Reset subcategory
          this.subcategoryControl.setValue(null);
        })
      )
      .subscribe()
    );
  }

  /**
   * Submit event emitting a create quiz event to te parent
   */
  onSubmit() {
    this.createQuiz.emit(this.form.value as QuizConfigModel);
  }
}
