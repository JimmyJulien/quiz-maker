import { Component, OnDestroy, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, forkJoin, tap } from 'rxjs';
import { QuizInputComponent } from '../shared/components/quiz-input/quiz-input.component';
import { QuizSelectComponent } from '../shared/components/quiz-select/quiz-select.component';
import { QuizConfigModel } from '../shared/models/quiz-config.model';
import { QuizDifficultyModel } from '../shared/models/quiz-difficulty.model';
import { QuizMakerService } from '../shared/services/quiz-maker.service';
import { existingValidator } from '../shared/validators/existing.validator';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QuizInputComponent,
    QuizSelectComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {

  readonly CATEGORY_FIELD = 'category';
  readonly SUBCATEGORY_FIELD = 'subcategory';
  readonly DIFFICULTY_FIELD = 'difficulty';

  readonly #quizMakerService = inject(QuizMakerService);

  /** Quiz form */
  form: FormGroup = new FormGroup({
    [this.CATEGORY_FIELD]: new FormControl(null, Validators.required),
    [this.DIFFICULTY_FIELD]: new FormControl(null, Validators.required)
  });

  /** Quiz categories loading indicator */
  areQuizCategoriesLoading = this.#quizMakerService.areQuizCategoriesLoading;

  /** Quiz categories */
  quizCategories = computed(() => {
    return [...new Set(
      this.#quizMakerService.quizCategories().map(category => category.name)
    )];
  });

  /** Quiz subcategories */
  quizSubcategories = this.#quizMakerService.quizSubcategories;

  /** Quiz difficulties loading indicator */
  areQuizDifficultiesLoading = this.#quizMakerService.areQuizDifficultiesLoading;

  /** Quiz difficulties */
  quizDifficulties = this.#quizMakerService.quizDifficulties;

  /** Quiz lines loading indicator */
  isQuizLoading = this.#quizMakerService.areQuizLinesLoading;

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

  constructor() {
    // Initialize dropdowns
    this.#initializeDropdowns();

    // Update category control existing validator
    this.#updateCategoryControlExistingValidator();

    // Disable category control if loading
    this.#handleCategoryControlLoading();

    // Disable difficulty control if loading
    this.#handleDifficultyControlLoading();

    // Update category and subcategory controls when category change
    this.#handleCategoryControlChange();

    // Update subcategory control
    this.#handleSubcategoryControl();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Submit event emitting a create quiz event to te parent
   */
  onSubmit() {
    const quizConfig: QuizConfigModel = {
      category: this.categoryControl.value,
      subcategory: this.subcategoryControl?.value,
      difficulty: this.difficultyControl.value.value
    };

    this.#quizMakerService.createQuizLines(quizConfig).subscribe()
  }

  #initializeDropdowns() {
    this.subscription.add(
      forkJoin([
        this.#quizMakerService.initializeQuizCategories(),
        this.#quizMakerService.initializeQuizDifficulties(),
      ])
      .subscribe()
    );
  }

  #updateCategoryControlExistingValidator() {
    this.subscription.add(
      toObservable(this.quizCategories)
      .pipe(
        tap(categories => {
          if(categories.length > 0) {
            this.categoryControl.addValidators(existingValidator(categories));
          }
        })
      )
      .subscribe()
    );
  }

  #handleCategoryControlLoading() {
    this.subscription.add(
      toObservable(this.areQuizCategoriesLoading)
      .pipe(
        tap(loading => {
          if(loading) {
            this.categoryControl.disable();
          }
          else {
            this.categoryControl.enable();
          }
        })
      )
      .subscribe()
    );
  }

  #handleDifficultyControlLoading() {
    this.subscription.add(
      toObservable(this.areQuizDifficultiesLoading)
      .pipe(
        tap(loading => {
          if(loading) {
            this.difficultyControl.disable();
          }
          else {
            this.difficultyControl.enable();
          }
        })
      )
      .subscribe()
    );
  }
    
  #handleCategoryControlChange() {
    this.subscription.add(
      this.categoryControl.valueChanges
      .pipe(
        tap(category => {
          // Select category
          this.#quizMakerService.selectCategory(category);

          // Reset subcategory (if existing)
          this.subcategoryControl?.reset();
        })
      )
      .subscribe()
    );
  }

  #handleSubcategoryControl() {
    this.subscription.add(
      toObservable(this.quizSubcategories)
      .pipe(
        tap(subcategories => {
          if (subcategories.length > 0) {
            this.form.addControl(
              this.SUBCATEGORY_FIELD,
              new FormControl(null, [Validators.required, existingValidator(subcategories)])
            );
          }
          else {
            this.form.removeControl(this.SUBCATEGORY_FIELD);
          }
        })
      )
      .subscribe()
    );
  }
}
