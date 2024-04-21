import { Routes } from '@angular/router';
import { quizGuard } from './guards/quiz.guard';

/** App routes */
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./components/quiz/quiz.component').then(c => c.QuizComponent),
    canActivate: [quizGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];
