import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { ROUTE_PATHS } from '../app.routes';
import { QuizMakerService } from '../shared/services/quiz-maker.service';

export const resultGuard: CanActivateFn = () => {

  const quizMakerService = inject(QuizMakerService);
  const router = inject(Router);

  const areQuizLinesDefined = quizMakerService.quizLines().length > 0;
  const isQuizComplete = quizMakerService.isQuizComplete();

  return areQuizLinesDefined && isQuizComplete ? of(true) : router.parseUrl(`/${ROUTE_PATHS.HOME}`);;
};
