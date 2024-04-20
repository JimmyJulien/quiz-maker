import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { QuizzAnswerModel } from 'src/app/models/quizz-answer.model';
import { QuizzConfigModel } from 'src/app/models/quizz-config.model';
import { QuizzLineModel } from 'src/app/models/quizz-line.model';
import { QuizzMakerService } from 'src/app/services/quizz-maker.service';
import { QuizzAction } from 'src/app/types/quizz-action.type';
import { QuizzActionComponent } from '../quizz-action/quizz-action.component';
import { QuizzFormComponent } from '../quizz-form/quizz-form.component';
import { QuizzKoComponent } from '../quizz-ko/quizz-ko.component';
import { QuizzLinesComponent } from '../quizz-lines/quizz-lines.component';
import { QuizzScoreComponent } from '../quizz-score/quizz-score.component';

@Component({
  templateUrl: './quizz.component.html',
  styleUrl: './quizz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    QuizzKoComponent,
    QuizzFormComponent,
    QuizzLinesComponent,
    QuizzScoreComponent,
    QuizzActionComponent,
  ],
})
export class QuizzComponent implements OnDestroy {
  
  readonly #quizzMakerService = inject(QuizzMakerService);

  /** Quizz maker KO indicator from the quizz service */
  isQuizzMakerKo = this.#quizzMakerService.isQuizzMakerKo;

  /** Indicates if quizz results are actually shown */
  areResultsShown = this.#quizzMakerService.areResultsShown;

  /** Quizz categories loading indicator from the quizz service */
  areQuizzCategoriesLoading = this.#quizzMakerService.areQuizzCategoriesLoading;

  /** Quizz categories from the quizz service */
  quizzCategories = computed(() => {
    return [...new Set(
      this.#quizzMakerService.quizzCategories().map(category => category.name)
    )];
  });

  /** Quizz subcategories */
  quizzSubcategories = this.#quizzMakerService.quizzSubcategories;

  /** Quizz difficulties loading indicator from the quizz service */
  areQuizzDifficultiesLoading = this.#quizzMakerService.areQuizzDifficultiesLoading;

  /** Quizz difficulties from the quizz service */
  quizzDifficulties = this.#quizzMakerService.quizzDifficulties;

  /** Quizz lines loading indicator from the quizz service */
  areQuizzLinesLoading = this.#quizzMakerService.areQuizzLinesLoading;

  /** Quizz lines from the quizz service */
  quizzLines = this.#quizzMakerService.quizzLines;

  /** Indicates if a question can be changed */
  canQuestionBeChanged = this.#quizzMakerService.canQuestionBeChanged;

  /** Quizz complete indicator from the quizz service */
  isQuizzComplete = this.#quizzMakerService.isQuizzComplete;

  /** Subscription used to unsubscribe when the component is destroyed */
  subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      forkJoin([
        this.#quizzMakerService.initializeQuizzCategories(),
        this.#quizzMakerService.initializeQuizzDifficulties(),
      ])
      .subscribe()
    );
  }

  /**
   * Unsubscribe subscription
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Reload quizz
   */
  onReload(): void {
    this.#quizzMakerService.reloadQuizz();
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.#quizzMakerService.selectCategory(category);
  }

  /**
   * Create quizz lines from the quizz configuration passed in parameter
   * @param quizzConfig the quizz configuration
   */
  createQuizzLines(quizzConfig: QuizzConfigModel): void {
    this.subscription.add(
      this.#quizzMakerService.createQuizzLines(quizzConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizzAnswer the answer picked
   */
  pickAnswer(quizzAnswer: QuizzAnswerModel): void {
    this.#quizzMakerService.pickAnswer(quizzAnswer);
  }

  /**
   * Change  the quizz line passed as a parameter
   * @param quizzLine the quizz line to change
   */  
  changeQuizzLine(quizzLine: QuizzLineModel): void {
    this.subscription.add(
      this.#quizzMakerService.changeQuizzLine(quizzLine).subscribe()
    );
  }

  /**
   * Do the quizz action passed as a parameter
   * @param action the action to do
   */
  doQuizzAction(action: QuizzAction): void {
    if(action === 'submit') this.#quizzMakerService.showQuizzResults();
    if(action === 'create') this.#quizzMakerService.createNewQuizz();
  }

}
