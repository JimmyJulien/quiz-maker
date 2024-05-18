import { TestBed } from '@angular/core/testing';

import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizMakerStateService } from './quiz-maker-state.service';

describe('QuizMakerStateService', () => {
  let service: QuizMakerStateService;

  beforeEach(() => {
    service = TestBed.inject(QuizMakerStateService);
  });

  describe('get', () => {
    it('should return the correct attribute state', () => {
      const quizDifficulties: QuizDifficultyModel[] = [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ];

      const result = service.get('quizDifficulties');

      expect(result()).toEqual(quizDifficulties);
    });
  });

  describe('set', () => {
    it('should set the correct attribute state', () => {
      const selectedQuizCategory = 'Category 1';

      service.set('selectedQuizCategory', selectedQuizCategory);

      expect(service.get('selectedQuizCategory')()).toEqual(selectedQuizCategory);
    });
  });

  describe('reset', () => {
    it('should reset the attribute to its initial state', () => {
      const quizConfig: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'easy',
        subcategory: null,
      };

      service.set('quizConfig', quizConfig);

      expect(service.get('quizConfig')()).toEqual(quizConfig);

      service.reset('quizConfig');

      expect(service.get('quizConfig')()).toEqual(service.INITIAL_STATE['quizConfig']);
    });
  });
});
