import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizMakerComponent } from './components/quiz-maker/quiz-maker.component';
import { QuizResultsComponent } from './components/quiz-results/quiz-results.component';

const routes: Routes = [
  { path: '', component: QuizMakerComponent },
  { path: 'results', component: QuizResultsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }
