import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { QuizCategoryModel } from '../../shared/models/quiz-category.model';
import { QuizDifficultyModel } from '../../shared/models/quiz-difficulty.model';
import { QuizMakerService } from '../../shared/services/quiz-maker.service';
import { HomeComponent } from './home.component';

function setup(withSubCategories: boolean = false) {
  const QUIZ_CATEGORIES: QuizCategoryModel[] = [
    {id: 1, name: 'Category1', subcategory: null},
    {id: 2, name: 'Category2', subcategory: 'Subcategory2'},
  ];

  const QUIZ_SUBCATEGORIES: string[] = [
    'Subcategory2',
  ];

  const QUIZ_DIFFICULTIES:QuizDifficultyModel[] = [
    {label: 'D1', value: 'Difficulty1'},
    {label: 'D2', value: 'Difficulty2'},
  ];

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let quizMakerServiceSpy = jasmine.createSpyObj<QuizMakerService>(
    'QuizMakerService',
    [
      'areQuizCategoriesLoading',
      'areQuizLinesLoading',
      'createQuizLines',
      'getQuizCategories',
      'getQuizDifficulties',
      'getQuizSubcategories',
      'initializeQuizCategories',
      'selectCategory',
    ]
  )

  TestBed.configureTestingModule({
    providers: [
      { provide: QuizMakerService, useValue: quizMakerServiceSpy }
    ],
  });

  quizMakerServiceSpy.areQuizCategoriesLoading.and.returnValue(signal(false));
  quizMakerServiceSpy.areQuizLinesLoading.and.returnValue(signal(false));
  quizMakerServiceSpy.getQuizCategories.and.returnValue(signal(QUIZ_CATEGORIES));
  quizMakerServiceSpy.getQuizDifficulties.and.returnValue(signal(QUIZ_DIFFICULTIES));
  quizMakerServiceSpy.getQuizSubcategories.and.returnValue(signal(withSubCategories ? QUIZ_SUBCATEGORIES : []));
  quizMakerServiceSpy.initializeQuizCategories.and.returnValue(of(QUIZ_CATEGORIES));

  fixture = TestBed.createComponent(HomeComponent);
  component = fixture.componentInstance;

  fixture.detectChanges();

  return {
    QUIZ_CATEGORIES,
    QUIZ_SUBCATEGORIES,
    QUIZ_DIFFICULTIES,
    component,
    fixture,
    quizMakerServiceSpy,
  };
}

describe('HomeComponent', () => {
  it('should initialize with an empty category input', () => {
    // WHEN
    const {fixture, component} = setup();
    const categoryInput = fixture.debugElement.query(By.css('[data-testid="category-input"]'));
    const categoryInputValue = component.categoryControl.value;

    // THEN
    expect(categoryInput).toBeDefined();
    expect(categoryInputValue).toBeNull();
  });

  it('should initialize with an empty difficulty select', () => {
    // WHEN
    const {fixture, component} = setup();
    const difficultySelect = fixture.debugElement.query(By.css('[data-testid="difficulty-select"]'));
    const difficultySelectValue = component.difficultyControl.value; 

    // THEN
    expect(difficultySelect).toBeDefined();
    expect(difficultySelectValue).toBeNull();
  });

  it('should initialize with a disabled create button', () => {
    // WHEN
    const {fixture} = setup();
    const createButton = fixture.debugElement.query(By.css('[data-testid="create-button"]'));

    // THEN
    expect(createButton).toBeDefined();
    expect(createButton.nativeElement.disabled).toBe(true);
  });

  it('should create quiz lines (case without subcategory)', () => {
    const {QUIZ_CATEGORIES, QUIZ_DIFFICULTIES, component, fixture, quizMakerServiceSpy} = setup();

    // Write an existing category
    component.categoryControl.setValue(QUIZ_CATEGORIES[0].name);

    // Select a difficulty
    component.difficultyControl.setValue(QUIZ_DIFFICULTIES[0]);

    // Mock quiz lines creation
    quizMakerServiceSpy.createQuizLines.and.returnValue(of([]));

    // Click create button
    const createButton = fixture.debugElement.query(By.css('[data-testid="create-button"]'));
    createButton.triggerEventHandler('click');
    fixture.detectChanges();

    // Check quiz lines creation
    expect(quizMakerServiceSpy.createQuizLines).toHaveBeenCalledWith({
      category: QUIZ_CATEGORIES[0].name,
      subcategory: null,
      difficulty: QUIZ_DIFFICULTIES[0].value,
    });
  });

  it('should create quiz lines (case with subcategory)', () => {
    const {
      QUIZ_CATEGORIES,
      QUIZ_SUBCATEGORIES,
      QUIZ_DIFFICULTIES,
      component,
      fixture,
      quizMakerServiceSpy
    } = setup(true);

    // Write an existing category
    component.categoryControl.setValue(QUIZ_CATEGORIES[1].name);

    // Write an existing subcategory
    component.subcategoryControl.setValue(QUIZ_SUBCATEGORIES[0]);

    // Select a difficulty
    component.difficultyControl.setValue(QUIZ_DIFFICULTIES[0]);

    // Mock quiz lines creation
    quizMakerServiceSpy.createQuizLines.and.returnValue(of([]));

    // Click create button
    const createButton = fixture.debugElement.query(By.css('[data-testid="create-button"]'));
    createButton.triggerEventHandler('click');
    fixture.detectChanges();

    // Check quiz lines creation
    expect(quizMakerServiceSpy.createQuizLines).toHaveBeenCalledWith({
      category: QUIZ_CATEGORIES[1].name,
      subcategory: QUIZ_SUBCATEGORIES[0],
      difficulty: QUIZ_DIFFICULTIES[0].value,
    });
  });

  it('should block quiz lines creation when non existing category', () => {
    const {QUIZ_DIFFICULTIES, component, fixture} = setup();

    // Write a non existing category
    component.categoryControl.setValue('non existing category');

    // Select a difficulty
    component.difficultyControl.setValue(QUIZ_DIFFICULTIES[0]);

    // Check create button is disabled
    const createButton = fixture.debugElement.query(By.css('[data-testid="create-button"]'));
    expect(createButton.nativeElement.disabled).toBe(true);
  });

  it('should block quiz lines creation when non existing subcategory', () => {
    const {QUIZ_CATEGORIES, QUIZ_DIFFICULTIES, component, fixture} = setup();

    // Write an existing category with subcategories
    component.categoryControl.setValue(QUIZ_CATEGORIES[1].name);

    // Write a non existing subcategory
    component.subcategoryControl.setValue('non existing subcategory');

    // Select a difficulty
    component.difficultyControl.setValue(QUIZ_DIFFICULTIES[0]);

    // Check create button is disabled
    const createButton = fixture.debugElement.query(By.css('[data-testid="create-button"]'));
    expect(createButton.nativeElement.disabled).toBe(true);
  });
});
