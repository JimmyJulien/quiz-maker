import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'quiz', loadChildren: () => import('./quiz/quiz.module').then(m => m.QuizModule) },
  { path: 'results', loadChildren: () => import('./results/results.module').then(m => m.ResultsModule) },
  { path: '', redirectTo: 'quiz', pathMatch: 'full' },
  { path: '**', redirectTo: 'quiz'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
