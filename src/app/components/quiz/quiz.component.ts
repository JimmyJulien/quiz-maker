import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { QuizAnswerModel } from 'src/app/models/quiz-answer.model';
import { QuizConfigModel } from 'src/app/models/quiz-config.model';
import { QuizLineModel } from 'src/app/models/quiz-line.model';
import { QuizMakerService } from 'src/app/services/quiz-maker.service';
import { QuizAction } from 'src/app/types/quiz-action.type';
import { QuizActionComponent } from '../quiz-action/quiz-action.component';
import { QuizFormComponent } from '../quiz-form/quiz-form.component';
import { QuizKoComponent } from '../quiz-ko/quiz-ko.component';
import { QuizLinesComponent } from '../quiz-lines/quiz-lines.component';
import { QuizScoreComponent } from '../quiz-score/quiz-score.component';

@Component({
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    QuizKoComponent,
    QuizFormComponent,
    QuizLinesComponent,
    QuizScoreComponent,
    QuizActionComponent,
  ],
})
export class QuizComponent implements OnDestroy {
  
  readonly #quizMakerService = inject(QuizMakerService);

  /** Quiz maker KO indicator from the quiz service */
  isQuizMakerKo = this.#quizMakerService.isQuizMakerKo;

  /** Indicates if quiz results are actually shown */
  areResultsShown = this.#quizMakerService.areResultsShown;

  /** Quiz categories loading indicator from the quiz service */
  areQuizCategoriesLoading = this.#quizMakerService.areQuizCategoriesLoading;

  /** Quiz categories from the quiz service */
  quizCategories = computed(() => {
    return [...new Set(
      this.#quizMakerService.quizCategories().map(category => category.name)
    )];
  });

  /** Quiz subcategories */
  quizSubcategories = this.#quizMakerService.quizSubcategories;

  /** Quiz difficulties loading indicator from the quiz service */
  areQuizDifficultiesLoading = this.#quizMakerService.areQuizDifficultiesLoading;

  /** Quiz difficulties from the quiz service */
  quizDifficulties = this.#quizMakerService.quizDifficulties;

  /** Quiz lines loading indicator from the quiz service */
  areQuizLinesLoading = this.#quizMakerService.areQuizLinesLoading;

  /** Quiz lines from the quiz service */
  quizLines = this.#quizMakerService.quizLines;

  /** Indicates if a question can be changed */
  canQuestionBeChanged = this.#quizMakerService.canQuestionBeChanged;

  /** Quiz complete indicator from the quiz service */
  isQuizComplete = this.#quizMakerService.isQuizComplete;

  /** Subscription used to unsubscribe when the component is destroyed */
  subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      forkJoin([
        this.#quizMakerService.initializeQuizCategories(),
        this.#quizMakerService.initializeQuizDifficulties(),
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
   * Reload quiz
   */
  onReload(): void {
    this.#quizMakerService.reloadQuiz();
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.#quizMakerService.selectCategory(category);
  }

  /**
   * Create quiz lines from the quiz configuration passed in parameter
   * @param quizConfig the quiz configuration
   */
  createQuizLines(quizConfig: QuizConfigModel): void {
    this.subscription.add(
      this.#quizMakerService.createQuizLines(quizConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.#quizMakerService.pickAnswer(quizAnswer);
  }

  /**
   * Change  the quiz line passed as a parameter
   * @param quizLine the quiz line to change
   */  
  changeQuizLine(quizLine: QuizLineModel): void {
    this.subscription.add(
      this.#quizMakerService.changeQuizLine(quizLine).subscribe()
    );
  }

  /**
   * Do the quiz action passed as a parameter
   * @param action the action to do
   */
  doQuizAction(action: QuizAction): void {
    if(action === 'submit') this.#quizMakerService.showQuizResults();
    if(action === 'create') this.#quizMakerService.createNewQuiz();
  }

}
