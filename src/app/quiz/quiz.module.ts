import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { QuizMakerFormComponent } from './components/quiz-maker/quiz-maker-form/quiz-maker-form.component';
import { QuizMakerQuestionsComponent } from './components/quiz-maker/quiz-maker-questions/quiz-maker-questions.component';
import { QuizMakerComponent } from './components/quiz-maker/quiz-maker.component';
import { QuizResultsCreateComponent } from './components/quiz-results/quiz-results-create/quiz-results-create.component';
import { QuizResultsLinesComponent } from './components/quiz-results/quiz-results-lines/quiz-results-lines.component';
import { QuizResultsScoreComponent } from './components/quiz-results/quiz-results-score/quiz-results-score.component';
import { QuizResultsComponent } from './components/quiz-results/quiz-results.component';
import { AnswerColorPipe } from './pipes/answer-color.pipe';
import { ScoreColorPipe } from './pipes/score-color.pipe';
import { ScoreFormatPipe } from './pipes/score-format.pipe';
import { QuizRoutingModule } from './quiz-routing.module';

const quizMakerComponents = [
  QuizMakerComponent,
  QuizMakerFormComponent,
  QuizMakerQuestionsComponent,
];

const quizResultsComponents = [
  QuizResultsComponent,
  QuizResultsLinesComponent,
  QuizResultsScoreComponent,
  QuizResultsCreateComponent,
];

const pipes = [
  ScoreColorPipe,
  ScoreFormatPipe,
  AnswerColorPipe,
];

@NgModule({
  declarations: [
    ...quizMakerComponents,
    ...quizResultsComponents,
    ...pipes,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuizRoutingModule
  ]
})
export class QuizModule { }
