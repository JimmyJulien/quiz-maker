import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '../shared/components/dropdown/dropdown.component';
import { QuizRoutingModule } from './quiz-routing.module';
import { QuizFormComponent } from './quiz/quiz-form/quiz-form.component';
import { QuizKoComponent } from './quiz/quiz-ko/quiz-ko.component';
import { QuizLinesComponent } from './quiz/quiz-lines/quiz-lines.component';
import { QuizSubmitComponent } from './quiz/quiz-submit/quiz-submit.component';
import { QuizComponent } from './quiz/quiz.component';

@NgModule({
  declarations: [
    QuizComponent,
    QuizKoComponent,
    QuizFormComponent,
    QuizLinesComponent,
    QuizSubmitComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuizRoutingModule,
    DropdownComponent,
  ]
})
export class QuizModule {}
