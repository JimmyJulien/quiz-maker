import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, SimpleChanges, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { QuizzConfigModel } from 'src/app/models/quizz-config.model';
import { QuizzDifficultyModel } from 'src/app/models/quizz-difficulty.model';
import { existingValidator } from '../../validators/existing.validator';
import { QuizzInputComponent } from '../quizz-input/quizz-input.component';
import { QuizzSelectComponent } from '../quizz-select/quizz-select.component';

// TODO update form
@Component({
  selector: 'qzm-quizz-form',
  templateUrl: './quizz-form.component.html',
  styleUrl: './quizz-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QuizzInputComponent,
    QuizzSelectComponent,
  ],
})
export class QuizzFormComponent implements OnInit, OnDestroy {

  readonly CATEGORY_FIELD = 'category';
  readonly SUBCATEGORY_FIELD = 'subcategory';
  readonly DIFFICULTY_FIELD = 'difficulty';

  /** Quizz categories loading indicator from the parent */
  areQuizzCategoriesLoading = input<boolean | null>(false);

  /** Quizz categories from the parent */
  quizzCategories = input<string[]>([]);
  
  /** Quizz subcategories from the parent */
  quizzSubcategories = input<string[]>([]);

  /** Quizz difficulties loading indicator from the parent */
  areQuizzDifficultiesLoading = input<boolean>(false);

  /** Quizz difficulties from the parent */
  quizzDifficulties = input<QuizzDifficultyModel[]>([]);

  /** Select a category */
  selectCategory = output<string>();

  /** Create quizz event emitter to the parent*/
  createQuizz = output<QuizzConfigModel>();

  /** Quizz form */
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
  get difficultyControl(): FormControl<QuizzDifficultyModel> {
    return this.form.get(this.DIFFICULTY_FIELD) as FormControl;
  }

  /** Quizz difficulty formatting function used by quizz-select */
  formatQuizzDifficultyFn = (value: QuizzDifficultyModel | null) => value?.label || null;
  
  /** Main subscription used to handle unsubscription on component destruction */
  subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    // Handle first call before ngOnOnInit (form not yet initialized)
    if(!this.form) return;

    // Update category validators (here because not an async validator)
    const quizzCategories = changes['quizzCategories'];
    
    if(quizzCategories?.currentValue?.length) {
      this.categoryControl.addValidators(
        existingValidator(quizzCategories.currentValue)
      );
    }

    // Update subcategory control
    const quizzSubcategories = changes['quizzSubcategories'];

    if(quizzSubcategories?.currentValue?.length) {
      this.form.addControl(
        this.SUBCATEGORY_FIELD,
        new FormControl(null, [Validators.required, existingValidator(quizzSubcategories.currentValue)])
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
   * Initialize the quizz form and its controls
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
   * Submit event emitting a create quizz event to te parent
   */
  onSubmit() {
    this.createQuizz.emit({
      category: this.categoryControl.value,
      subcategory: this.subcategoryControl?.value,
      difficulty: this.difficultyControl.value.value
    });
  }
}
