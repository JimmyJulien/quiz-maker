import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from 'src/app/app.routes';
import { QuizMakerService } from 'src/app/shared/services/quiz-maker.service';

export const quizGuard = () => {
  
  const quizMakerService = inject(QuizMakerService);
  const router = inject(Router);

  const quizLines = quizMakerService.getQuizLines();
  const areQuizLinesDefined = quizLines().length > 0;
  
  return areQuizLinesDefined ? true : router.parseUrl(`/${ROUTE_PATHS.HOME}`);
};
