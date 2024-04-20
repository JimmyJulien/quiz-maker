import { Routes } from '@angular/router';

/** App routes */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/quiz/quiz.component').then(c => c.QuizComponent),
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  }
];
