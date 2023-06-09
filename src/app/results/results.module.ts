import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AnswerColorPipe } from './pipes/answer-color.pipe';
import { ScoreColorPipe } from './pipes/score-color.pipe';
import { ScoreFormatPipe } from './pipes/score-format.pipe';
import { ResultsRoutingModule } from './results-routing.module';
import { ResultsCreateComponent } from './results/results-create/results-create.component';
import { ResultsLinesComponent } from './results/results-lines/results-lines.component';
import { ResultsScoreComponent } from './results/results-score/results-score.component';
import { ResultsComponent } from './results/results.component';

@NgModule({
  declarations: [
    ResultsComponent,
    ResultsLinesComponent,
    ResultsScoreComponent,
    ResultsCreateComponent,
    ScoreColorPipe,
    ScoreFormatPipe,
    AnswerColorPipe,
  ],
  imports: [
    CommonModule,
    ResultsRoutingModule,
  ]
})
export class ResultsModule {}
