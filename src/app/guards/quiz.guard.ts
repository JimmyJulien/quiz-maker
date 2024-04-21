import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { QuizMakerService } from '../services/quiz-maker.service';

export const quizGuard: CanActivateFn = () => {
  const quizMakerService = inject(QuizMakerService);
  const router = inject(Router);
  return quizMakerService.quizLines().length > 0 ? of(true) : router.parseUrl('/home');
};
