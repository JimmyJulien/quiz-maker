import { Routes } from '@angular/router';
import { quizGuard } from './quiz/quiz.guard';
import { resultGuard } from './result/result.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz.component').then(c => c.QuizComponent),
    canActivate: [quizGuard]
  },
  {
    path: 'result',
    loadComponent: () => import('./result/result.component').then(c => c.ResultComponent),
    canActivate: [resultGuard]
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
