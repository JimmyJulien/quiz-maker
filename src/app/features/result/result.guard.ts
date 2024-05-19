import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../app.routes';
import { QuizMakerService } from '../../shared/services/quiz-maker.service';

export const resultGuard = () => {

  const quizMakerService = inject(QuizMakerService);
  const router = inject(Router);

  const isQuizComplete = quizMakerService.isQuizComplete();
  return isQuizComplete() ? true : router.parseUrl(`/${ROUTE_PATHS.HOME}`);
};
