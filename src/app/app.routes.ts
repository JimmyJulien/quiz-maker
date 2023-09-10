import { Routes } from '@angular/router';

/** App routes */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/quizz/quizz.component').then(c => c.QuizzComponent),
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  }
];
