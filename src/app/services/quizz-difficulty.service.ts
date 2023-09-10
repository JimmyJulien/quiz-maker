import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QuizzDifficultyModel } from '../models/quizz-difficulty.model';

@Injectable({
  providedIn: 'root'
})
export class QuizzDifficultyService {
  
  /**
   * Get the quizz difficulties
   * @returns the quizz difficulties
   */
  getQuizzDifficulties(): Observable<QuizzDifficultyModel[]> {
    return of([
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ]);
  }
  
}
