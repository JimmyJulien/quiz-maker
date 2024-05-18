import { Routes } from '@angular/router';
import { quizGuard } from './quiz/quiz.guard';
import { resultGuard } from './result/result.guard';

export const ROUTE_PATHS = Object.freeze({
  HOME: 'home',
  QUIZ: 'quiz',
  RESULT:'result',
});

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: ROUTE_PATHS.QUIZ,
    loadComponent: () => import('./quiz/quiz.component').then(c => c.QuizComponent),
    canActivate: [quizGuard]
  },
  {
    path: ROUTE_PATHS.RESULT,
    loadComponent: () => import('./result/result.component').then(c => c.ResultComponent),
    canActivate: [resultGuard]
  },
  {
    path: '',
    redirectTo: ROUTE_PATHS.HOME,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: ROUTE_PATHS.HOME,
  }
];
