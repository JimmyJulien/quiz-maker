import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QuizDifficultyModel } from '../models/quiz-difficulty.model';

@Injectable({
  providedIn: 'root'
})
export class QuizDifficultyService {
  
  /**
   * Get the quiz difficulties
   * @returns the quiz difficulties
   */
  getQuizDifficulties(): Observable<QuizDifficultyModel[]> {
    return of([
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ]);
  }
  
}
