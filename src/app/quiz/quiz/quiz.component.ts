import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QuizAnswerModel } from 'src/app/shared/models/quiz-answer.model';
import { QuizConfigModel } from 'src/app/shared/models/quiz-config.model';
import { QuizDifficultyModel } from 'src/app/shared/models/quiz-difficulty.model';
import { QuizLineModel } from 'src/app/shared/models/quiz-line.model';
import { QuizMakerService } from 'src/app/shared/services/quiz-maker.service';

@Component({
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent implements OnDestroy {
  
  /** Quiz categories loading indicator from the quiz service */
  areQuizCategoriesLoading$ = this.quizMakerService.areQuizCategoriesLoading();

  /** Quiz lines loading indicator from the quiz service */
  areQuizLinesLoading$ = this.quizMakerService.areQuizLinesLoading();

  /** Quiz maker KO indicator from the quiz service */
  isQuizMakerKo$ = this.quizMakerService.isQuizMakerKo();

  /** Quiz categories from the quiz service */
  quizCategories$: Observable<string[] | null> = this.quizMakerService.getQuizCategories();

  /** Quiz subcategories */
  quizSubcategories$: Observable<string[] | null> = this.quizMakerService.getQuizSubcategories();

  /** Quiz difficulties from the quiz service */
  quizDifficulties: QuizDifficultyModel[] = this.quizMakerService.getQuizDifficulties();

  /** Quiz lines from the quiz service */
  quizLines$: Observable<QuizLineModel[]> = this.quizMakerService.getQuizLines();

  /** Quiz complete indicator from the quiz service */
  isQuizComplete$: Observable<boolean> = this.quizMakerService.isQuizComplete();
  
  /** Subscription used to unsubscribe when the component is destroyed */
  souscription = new Subscription();

  constructor(private readonly quizMakerService: QuizMakerService) {}

  ngOnInit(): void {
    this.souscription.add(
      this.quizMakerService.initializeQuizCategories().subscribe()
    );
  }

  /**
   * Unsubscribe souscription
   */
  ngOnDestroy(): void {
    this.souscription.unsubscribe();
  }

  /**
   * Reload quiz
   */
  onReload(): void {
    this.quizMakerService.reloadQuiz();
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string): void {
    this.quizMakerService.selectCategory(category);
  }

  /**
   * Create quiz lines from the quiz configuration passed in parameter
   * @param quizConfig the quiz configuration
   */
  createQuizLines(quizConfig: QuizConfigModel): void {
    this.souscription.add(
      this.quizMakerService.createQuizLines(quizConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizAnswerModel): void {
    this.quizMakerService.pickAnswer(quizAnswer);
  }

  /**
   * Go to the quiz results when answers are submitted
   */
  onSubmit(): void {
    this.quizMakerService.goToQuizResults();
  }
}
