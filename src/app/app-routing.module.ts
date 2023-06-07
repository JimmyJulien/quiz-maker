import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Note 1: No 404 page so always redirect to quiz
// Note 2: Lazy loading but not really useful here
const routes: Routes = [
  { path: 'quiz', loadChildren: () => import('./quiz/quiz.module').then(m => m.QuizModule) },
  { path: '', redirectTo: 'quiz', pathMatch: 'full' },
  { path: '**', redirectTo: 'quiz'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
