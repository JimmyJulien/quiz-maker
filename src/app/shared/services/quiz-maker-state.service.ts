import { Injectable, Signal, computed, signal } from '@angular/core';
import { QuizCategoryModel } from '../models/quiz-category.model';
import { QuizConfigModel } from '../models/quiz-config.model';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';
import { QuizLineModel } from '../models/quiz-line.model';

export type QuizMakerState = {
  areQuizCategoriesLoading: boolean,
  areQuizLinesLoading: boolean,
  canQuestionBeChanged: boolean,
  isQuizMakerKo: boolean,
  quizCategories: QuizCategoryModel[],
  quizConfig: QuizConfigModel | null,
  quizDifficulties: QuizDifficultyModel[],
  quizLines: QuizLineModel[],
  selectedQuizCategory: string | null,
};

export type QuizMakerStatAttribute = keyof QuizMakerState;

@Injectable({
  providedIn: 'root'
})
export class QuizMakerStateService {
  
  readonly INITIAL_STATE: QuizMakerState = {
    areQuizCategoriesLoading: false,
    areQuizLinesLoading: false,
    canQuestionBeChanged: true,
    isQuizMakerKo: false,
    quizCategories: [],
    quizConfig: null,
    quizDifficulties: [
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ],
    quizLines: [],
    selectedQuizCategory: null,
  };

  #state = signal<QuizMakerState>({...this.INITIAL_STATE});

  get(attribute: QuizMakerStatAttribute): Signal<QuizMakerState[QuizMakerStatAttribute]> {
    return computed(() => this.#state()[attribute]);
  }

  set(attribute: QuizMakerStatAttribute, newValue: QuizMakerState[QuizMakerStatAttribute]) {
    const actualValue = this.#state()[attribute];

    if(actualValue !== newValue) {
      this.#state.update((state) => ({...state, [attribute]: newValue}));
    }
  }

  reset(attribute: QuizMakerStatAttribute) {
    const initialAttributeValue = this.INITIAL_STATE[attribute];
    this.#state.update((state) => ({...state, [attribute]: initialAttributeValue}));
  }
}
