import { Component, OnDestroy, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { QuizAutocompleteComponent } from '../../shared/components/quiz-autocomplete/quiz-autocomplete.component';
import { QuizSelectComponent } from '../../shared/components/quiz-select/quiz-select.component';
import { QuizConfigModel } from '../../shared/models/quiz-config.model';
import { QuizDifficultyModel } from '../../shared/models/quiz-difficulty.model';
import { QuizMakerService } from '../../shared/services/quiz-maker.service';
import { existingValidator } from '../../shared/validators/existing.validator';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QuizAutocompleteComponent,
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
  form = new FormGroup({
    [this.CATEGORY_FIELD]: new FormControl<string | null>(null, Validators.required),
    [this.SUBCATEGORY_FIELD]: new FormControl<string | null>(null),
    [this.DIFFICULTY_FIELD]: new FormControl<QuizDifficultyModel | null>(null, Validators.required)
  });

  /** Quiz categories loading indicator */
  areQuizCategoriesLoading = this.#quizMakerService.areQuizCategoriesLoading();

  /** Quiz categories */
  quizCategories = computed(() => {
    const quizCategories = this.#quizMakerService.getQuizCategories();
    return [...new Set(quizCategories().map(category => category.name))];
  });

  /** Quiz subcategories */
  quizSubcategories = this.#quizMakerService.getQuizSubcategories();

  /** Quiz difficulties */
  quizDifficulties = this.#quizMakerService.getQuizDifficulties();

  /** Quiz lines loading indicator */
  isQuizLoading = this.#quizMakerService.areQuizLinesLoading();

  /** Category control getter */
  get categoryControl(): FormControl<string | null> {
    return this.form.controls[this.CATEGORY_FIELD];
  }

  /** Subcategory control getter */
  get subcategoryControl(): FormControl<string | null> {
    return this.form.controls[this.SUBCATEGORY_FIELD];
  }

  /** Difficulty control getter */
  get difficultyControl(): FormControl<QuizDifficultyModel | null> {
    return this.form.controls[this.DIFFICULTY_FIELD];
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

    // Update category and subcategory controls when category change
    this.#handleCategoryControlChange();

    // Update subcategory control
    this.#handleSubcategoryControlValidators();
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
      difficulty: this.difficultyControl.value!.value
    };

    this.#quizMakerService.createQuizLines(quizConfig).subscribe();
  }

  #initializeDropdowns() {
    this.subscription.add(
      this.#quizMakerService.initializeQuizCategories().subscribe()
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

  #handleCategoryControlChange() {
    this.subscription.add(
      this.categoryControl.valueChanges
      .pipe(
        tap(category => {
          this.#quizMakerService.selectCategory(category);
          this.subcategoryControl.reset();
        })
      )
      .subscribe()
    );
  }

  #handleSubcategoryControlValidators() {
    this.subscription.add(
      toObservable(this.quizSubcategories)
      .pipe(
        tap(subcategories => {
          if (subcategories.length > 0) {
            this.subcategoryControl.addValidators(Validators.required);
            this.subcategoryControl.addValidators(existingValidator(subcategories));
          }
          else {
            this.subcategoryControl.clearValidators();
          }
        })
      )
      .subscribe()
    );
  }
}
