import { Component, OnDestroy, OnInit, SimpleChanges, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, forkJoin, tap } from 'rxjs';
import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizMakerService } from '../services/quiz-maker.service';
import { QuizInputComponent } from '../shared/components/quiz-input/quiz-input.component';
import { QuizSelectComponent } from '../shared/components/quiz-select/quiz-select.component';
import { existingValidator } from '../validators/existing.validator';

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
export class HomeComponent implements OnInit, OnDestroy {

  readonly CATEGORY_FIELD = 'category';
  readonly SUBCATEGORY_FIELD = 'subcategory';
  readonly DIFFICULTY_FIELD = 'difficulty';

  readonly #quizMakerService = inject(QuizMakerService);

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

  constructor() {
    this.subscription.add(
      forkJoin([
        this.#quizMakerService.initializeQuizCategories(),
        this.#quizMakerService.initializeQuizDifficulties(),
      ])
      .subscribe()
    );
  }

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
          // Select category
          this.#quizMakerService.selectCategory(category);

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
    const quizConfig: QuizConfigModel = {
      category: this.categoryControl.value,
      subcategory: this.subcategoryControl?.value,
      difficulty: this.difficultyControl.value.value
    };

    this.#quizMakerService.createQuizLines(quizConfig).subscribe()
  }
}
