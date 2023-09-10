import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QuizzAnswerModel } from 'src/app/models/quizz-answer.model';
import { QuizzConfigModel } from 'src/app/models/quizz-config.model';
import { QuizzDifficultyModel } from 'src/app/models/quizz-difficulty.model';
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
  styleUrls: ['./quizz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    QuizzKoComponent,
    QuizzFormComponent,
    QuizzLinesComponent,
    QuizzScoreComponent,
    QuizzActionComponent,
  ],
})
export class QuizzComponent implements OnDestroy {
  
  /** Quizz categories loading indicator from the quizz service */
  areQuizzCategoriesLoading$ = this.quizzMakerService.areQuizzCategoriesLoading();

  /** Quizz lines loading indicator from the quizz service */
  areQuizzLinesLoading$ = this.quizzMakerService.areQuizzLinesLoading();

  /** Quizz maker KO indicator from the quizz service */
  isQuizzMakerKo$ = this.quizzMakerService.isQuizzMakerKo();

  /** Quizz categories from the quizz service */
  quizCategories$: Observable<string[] | null> = this.quizzMakerService.getQuizzCategories();

  /** Quizz subcategories */
  quizSubcategories$: Observable<string[] | null> = this.quizzMakerService.getQuizzSubcategories();

  /** Quizz difficulties from the quizz service */
  quizDifficulties$: Observable<QuizzDifficultyModel[]> = this.quizzMakerService.getQuizzDifficulties();

  /** Quizz lines from the quizz service */
  quizLines$: Observable<QuizzLineModel[]> = this.quizzMakerService.getQuizzLines();

  /** Quizz complete indicator from the quizz service */
  isQuizzComplete$: Observable<boolean> = this.quizzMakerService.isQuizzComplete();
  
  /** Indicates if a question can be changed */
  canQuestionBeChanged$ = this.quizzMakerService.canQuestionBeChanged();

  /** Subscription used to unsubscribe when the component is destroyed */
  subscription = new Subscription();

  /** Indicates if quizz results are actually shown */
  areResultsShown$ = this.quizzMakerService.areResultsShown();

  constructor(private readonly quizzMakerService: QuizzMakerService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.quizzMakerService.initializeQuizzCategories().subscribe()
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
    this.quizzMakerService.reloadQuizz();
  }

  /**
   * Select a new category
   * @param category the new selected category
   */
  selectCategory(category: string | null): void {
    this.quizzMakerService.selectCategory(category);
  }

  /**
   * Create quizz lines from the quizz configuration passed in parameter
   * @param quizConfig the quizz configuration
   */
  createQuizzLines(quizConfig: QuizzConfigModel): void {
    this.subscription.add(
      this.quizzMakerService.createQuizzLines(quizConfig).subscribe()
    );
  }

  /**
   * Pick an answer
   * @param quizAnswer the answer picked
   */
  pickAnswer(quizAnswer: QuizzAnswerModel): void {
    this.quizzMakerService.pickAnswer(quizAnswer);
  }

  /**
   * Change  the quizz line passed as a parameter
   * @param quizLine the quizz line to change
   */  
  changeQuizzLine(quizLine: QuizzLineModel): void {
    this.subscription.add(
      this.quizzMakerService.changeQuizzLine(quizLine).subscribe()
    );
  }

  /**
   * Do the quizz action passed as a parameter
   * @param action the action to do
   */
  doQuizzAction(action: QuizzAction): void {
    if(action === 'submit') this.quizzMakerService.showQuizzResults();
    if(action === 'create') this.quizzMakerService.createNewQuizz();
  }

}
