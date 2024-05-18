import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { isEmpty, of, tap, throwError } from "rxjs";
import { ApiQuestionModel } from "../models/api-question.model";
import { QuizAnswerModel } from "../models/quiz-answer.model";
import { QuizCategoryModel } from "../models/quiz-category.model";
import { QuizConfigModel } from "../models/quiz-config.model";
import { QuizDifficultyModel } from "../models/quiz-difficulty.model";
import { QuizLineModel } from "../models/quiz-line.model";
import { QuizCategoryService } from "./quiz-category.service";
import { QuizMakerStateService } from "./quiz-maker-state.service";
import { QuizMakerService } from "./quiz-maker.service";
import { QuizQuestionService } from "./quiz-question.service";

describe('QuizMakerService', () => {
  let service: QuizMakerService;

  let quizMakerStateServiceSpy: jasmine.SpyObj<QuizMakerStateService>;
  let categoryServiceSpy: jasmine.SpyObj<QuizCategoryService>;
  let questionServiceSpy: jasmine.SpyObj<QuizQuestionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    quizMakerStateServiceSpy = jasmine.createSpyObj<QuizMakerStateService>(
      'QuizMakerStateService',
      ['get', 'set', 'reset']
    );

    categoryServiceSpy = jasmine.createSpyObj<QuizCategoryService>(
      'QuizCategoryService',
      ['getQuizCategories']
    );

    questionServiceSpy = jasmine.createSpyObj<QuizQuestionService>(
      'QuizQuestionService',
      ['getApiQuestions']
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        QuizMakerService,
        { provide: QuizMakerStateService, useValue: quizMakerStateServiceSpy },
        { provide: QuizCategoryService, useValue: categoryServiceSpy },
        { provide: QuizQuestionService, useValue: questionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(QuizMakerService);
  });

  describe('getQuizLines', () => {
    it('should return an quiz line list', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));
      const result = service.getQuizLines();
      expect(result()).toEqual(quizLines);
    });
  });

  describe('areQuizLinesLoading', () => {
    it('should return true if the quiz lines are loading', () => {
      quizMakerStateServiceSpy.get.withArgs('areQuizLinesLoading').and.returnValue(signal(true));
      const result = service.areQuizLinesLoading();
      expect(result()).toBe(true);
    });
  });

  describe('isQuizMakerKo', () => {
    it('should return true if the quiz maker is ko', () => {
      quizMakerStateServiceSpy.get.withArgs('isQuizMakerKo').and.returnValue(signal(true));
      const result = service.isQuizMakerKo();
      expect(result()).toBe(true);
    });
  });

  describe('getQuizCategories', () => {
    it('should return a category list', () => {
      const categories: QuizCategoryModel[] = [
        {id: 1, name: 'Category 1', subcategory: null},
        {id: 2, name: 'Category 2', subcategory: null},
        {id: 3, name: 'Category 3', subcategory: null},
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(categories));
      const result = service.getQuizCategories();
      expect(result()).toEqual(categories);
    });
  });

  describe('areQuizCategoriesLoading', () => {
    it('should return true if the quiz categories are loading', () => {
      quizMakerStateServiceSpy.get.withArgs('areQuizCategoriesLoading').and.returnValue(signal(true));
      const result = service.areQuizCategoriesLoading();
      expect(result()).toBe(true);
    });
  });

  describe('getSelectedQuizCategory', () => {
    it('should return a selected category', () => {
      const selectedCategory: string = 'Category 1';
      quizMakerStateServiceSpy.get.withArgs('selectedQuizCategory').and.returnValue(signal(selectedCategory));
      const result = service.getSelectedQuizCategory();
      expect(result()).toBe(selectedCategory);
    });
  });

  describe('getQuizDifficulties', () => {
    it('should return a difficulty list', () => {
      const difficulties: QuizDifficultyModel[] = [
        {label: 'Easy', value: 'easy'},
        {label: 'Medium', value: 'medium'},
        {label: 'Hard', value: 'hard'},
      ];

      quizMakerStateServiceSpy.get.withArgs('quizDifficulties').and.returnValue(signal(difficulties));
      const result = service.getQuizDifficulties();
      expect(result()).toEqual(difficulties);
    });
  });

  describe('getQuizConfig', () => {
    it('should return a quiz config', () => {
      const quizConfig: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'easy',
        subcategory: null,
      };

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(quizConfig));
      const result = service.getQuizConfig();
      expect(result()).toEqual(quizConfig);
    });
  });

  describe('canQuestionBeChanged', () => {
    it('should return true if the question can be changed', () => {
      quizMakerStateServiceSpy.get.withArgs('canQuestionBeChanged').and.returnValue(signal(true));
      const result = service.canQuestionBeChanged();
      expect(result()).toBe(true);
    });
  });
  
  describe('getQuizSubcategories', () => {
    it('should return an empty list when no categories are defined', () => {
      const quizCategories: QuizCategoryModel[] = [];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('selectedQuizCategory').and.returnValue(signal(null));

      const quizSubcategories = service.getQuizSubcategories();

      expect(quizSubcategories()).toEqual([]);
    });

    it('should return an empty list when no category in the list correspond to the selected category', () => {
      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('selectedQuizCategory').and.returnValue(signal('Category 3'));

      const quizSubcategories = service.getQuizSubcategories();

      expect(quizSubcategories()).toEqual([]);
    });

    it('should return an empty list when the selected category has no subcategory', () => {
      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('selectedQuizCategory').and.returnValue(signal('Category 1'));

      const quizSubcategories = service.getQuizSubcategories();

      expect(quizSubcategories()).toEqual([]);
    });

    it('should return a list of distinct subcategories when the selected category has subcategories', () => {
      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: 'Subcategory 1' },
        { id: 2, name: 'Category 1', subcategory: 'Subcategory 2' },
        { id: 3, name: 'Category 2', subcategory: null },
        { id: 4, name: 'Category 3', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('selectedQuizCategory').and.returnValue(signal('Category 1'));

      const quizSubcategories = service.getQuizSubcategories();

      expect(quizSubcategories()).toEqual(['Subcategory 1', 'Subcategory 2']);
    });
  });

  describe('isQuizComplete', () => {
    it('should return true if all the questions have a user answer', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 2'
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 2'
        },
      ];
      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));
      const result = service.isQuizComplete();
      expect(result()).toBe(true);
    });

    it('should return false if one of the questions have no user answer', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 2'
        },
      ];
      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));
      const result = service.isQuizComplete();
      expect(result()).toBe(false);
    });

    it('should return false if none of the questions have a user answer', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];
      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));
      const result = service.isQuizComplete();
      expect(result()).toBe(false);
    });
  });

  describe('isQuizComplete', () => {
    it("should return false when user didn't answer any question", () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));

      const isQuizComplete = service.isQuizComplete();

      expect(isQuizComplete()).toBe(false);
    });

    it("should return false when user didn't answer all questions", () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 1'
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));

      const isQuizComplete = service.isQuizComplete();

      expect(isQuizComplete()).toBe(false);
    });

    it("should return true when user answered all questions", () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 1'
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 1'
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));

      const isQuizComplete = service.isQuizComplete();

      expect(isQuizComplete()).toBe(true);
    });
  });

  describe('initializeQuizCategories', () => {
    it('should use existing categories if they exist', () => {
      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));

      service.initializeQuizCategories()
      .pipe(
        tap(categories => {
          expect(categories).toEqual(quizCategories);
        })
      )
      .subscribe();
    });

    it("should fetch categories if they don't exist", () => {
      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal([]));
      categoryServiceSpy.getQuizCategories.and.returnValue(of(quizCategories));

      service.initializeQuizCategories()
      .pipe(
          tap(() => {
            expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('quizCategories', quizCategories);            
          })
        )
       .subscribe();
    });

    it("should update quiz maker ko indicator and log an error when fetching categories fails", () => {
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal([]));
      categoryServiceSpy.getQuizCategories.and.returnValue(throwError(() => 'Error'));

      const consoleErrorSpy = spyOn(console, 'error');

      service.initializeQuizCategories()
      .pipe(
          isEmpty(),
          tap((isEmpty) => {
            expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('isQuizMakerKo', true);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(isEmpty).toBe(true);
          }),
        )
       .subscribe();
    });
  });

  describe('reloadQuiz', () => {
    it('should reset the quiz maker ko indicator and reload page', () => {
      service.reloadQuiz();
      expect(quizMakerStateServiceSpy.reset).toHaveBeenCalledWith('isQuizMakerKo');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('selectCategory', () => {
    it('should set the selected category', () => {
      const category = 'Category 1';
      service.selectCategory(category);
      expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('selectedQuizCategory', category);
    });
  });

  describe('createQuizLines', () => {
    it('should return an empty array if no config is defined', () => {
       service.createQuizLines(null)
       .pipe(
          tap(quizLines => {
            expect(quizLines).toEqual([]);
          })
        )
       .subscribe();
    });

    it('should throw an exception if no categories are defined', () => {
      const quizConfig: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'Easy',
        subcategory: null
      };

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(quizConfig));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal([]));

      try {
        service.createQuizLines(quizConfig);
      }
      catch(error) {
        expect(error).toEqual(new Error('No quiz config or quiz categories defined'));
      }
    });

    it('should throw an error if unknown category is passed', () => {
      const quizConfig: QuizConfigModel = {
        category: 'Category 3',
        difficulty: 'Easy'
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: 'Subcategory 2' },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(quizConfig));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));

      try {
        service.createQuizLines(quizConfig);
      }
      catch(error) {
        expect(error).toEqual(new Error("Quiz category 'Category 3' doesn't exist"));
      }
    });

    it('should create quiz lines from the config', () => {
      const config: QuizConfigModel = {
        category: 'Category 2',
        difficulty: 'Easy',
        subcategory: 'Subcategory 1'
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: 'Subcategory 1' },
      ];

      const questions: ApiQuestionModel[] = [
        {
          category: 'Category 2 : Subcategory 1',
          difficulty: 'Easy',
          question: 'Question 1',
          correct_answer: 'Answer 1',
          incorrect_answers: ['Answer 2', 'Answer 3', 'Answer 4'],
          type: 'Multiple'
        },
        {
          category: 'Category 2 : Subcategory 1',
          difficulty: 'Easy',
          question: 'Question 2',
          correct_answer: 'Answer 1',
          incorrect_answers: ['Answer 3', 'Answer 4', 'Answer 5'],
          type: 'Multiple'
        },
        {
          category: 'Category 2 : Subcategory 1',
          difficulty: 'Easy',
          question: 'Question 3',
          correct_answer: 'Answer 1',
          incorrect_answers: ['Answer 3', 'Answer 4', 'Answer 5'],
          type: 'Multiple'
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      questionServiceSpy.getApiQuestions.and.returnValue(of(questions));
      
      service.createQuizLines(config)
      .pipe(
        tap(quizLines => {
          expect(quizLines.length).toBe(3);
          expect(quizLines.some(line => line.question === 'Question 1')).toBe(true);
          expect(quizLines.some(line => line.question === 'Question 2')).toBe(true);
          expect(quizLines.some(line => line.question === 'Question 3')).toBe(true);
          expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('quizLines', quizLines);
        })
      )
      .subscribe();
    });

    it('should update quiz maker ko indicator and log an error when fetching questions fails', () => {
      const config: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'Easy',
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      questionServiceSpy.getApiQuestions.and.returnValue(throwError(() => 'Error'));

      const consoleErrorSpy = spyOn(console, 'error');

      service.createQuizLines(config)
      .pipe(
        isEmpty(),
        tap((isEmpty) => {
          expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('isQuizMakerKo', true);
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(isEmpty).toBe(true);
        }),
      )
      .subscribe();
    });
  });

  describe('pickAnswer', () => {
    it('should update quiz lines with the user answer', () => {
      const quizAnswer: QuizAnswerModel = {
        question: 'Question 1',
        answer: 'Answer 1',
      };

      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        }
      ];

      const newQuizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: 'Answer 1'
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        }
      ];

      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(quizLines));

      service.pickAnswer(quizAnswer);

      expect(quizMakerStateServiceSpy.set).toHaveBeenCalledWith('quizLines', newQuizLines);
    });
  });

  describe('changeQuizLine', () => {
    it('should do nothing if the config category is not defined', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];

      const config: QuizConfigModel = {
        category: null,
        difficulty: 'Easy',
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(config));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));

      service.changeQuizLine(quizLines[0])
      .pipe(
        isEmpty(),
        tap((isEmpty) => {;
          expect(isEmpty).toBe(true);
        })
      )
      .subscribe();
    });

    it('should do nothing if the config difficulty is not defined', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];

      const config: QuizConfigModel = {
        category: 'Category 1',
        difficulty: null,
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(config));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));

      service.changeQuizLine(quizLines[0])
      .pipe(
        isEmpty(),
        tap((isEmpty) => {;
          expect(isEmpty).toBe(true);
        })
      )
      .subscribe();
    });

    it('should do nothing if no categories are defined', () => {
      const quizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];

      const config: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'Easy',
      };

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(config));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(null));

      service.changeQuizLine(quizLines[0])
      .pipe(
        isEmpty(),
        tap((isEmpty) => {;
          expect(isEmpty).toBe(true);
        })
      )
      .subscribe();
    });

    // TODO should show a notification when no new question is found
    it('should do nothing when no new question is found', () => {
      const initialQuizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];

      const config: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'Easy'
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: null },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      const newApiQuestions: ApiQuestionModel[] = [
        {
          category: 'Category 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 1',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
        {
          category: 'Category 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 2',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
        {
          category: 'Category 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 3',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(config));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(initialQuizLines));
      questionServiceSpy.getApiQuestions.and.returnValue(of(newApiQuestions));

      service.changeQuizLine(initialQuizLines[0])
      .pipe(
        isEmpty(),
        tap((isEmpty) => {
          expect(isEmpty).toBe(true);
        })
      )
      .subscribe();
    });


    it('should replace thie quiz line with a new one', () => {
      const initialQuizLines: QuizLineModel[] = [
        {
          question: 'Question 1',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 2',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
        {
          question: 'Question 3',
          answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 'Answer 1',
          userAnswer: null
        },
      ];

      const config: QuizConfigModel = {
        category: 'Category 1',
        difficulty: 'Easy',
        subcategory: 'Subcategory 1'
      };

      const quizCategories: QuizCategoryModel[] = [
        { id: 1, name: 'Category 1', subcategory: 'Subcategory 1' },
        { id: 2, name: 'Category 2', subcategory: null },
      ];

      const newApiQuestions: ApiQuestionModel[] = [
        {
          category: 'Category 1 : Subcategory 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 4',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
        {
          category: 'Category 1 : Subcategory 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 5',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
        {
          category: 'Category 1 : Subcategory 1',
          type: 'Multiple',
          difficulty: 'easy',
          question: 'Question 6',
          incorrect_answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correct_answer: 'Answer 1',
        },
      ];

      quizMakerStateServiceSpy.get.withArgs('quizConfig').and.returnValue(signal(config));
      quizMakerStateServiceSpy.get.withArgs('quizCategories').and.returnValue(signal(quizCategories));
      quizMakerStateServiceSpy.get.withArgs('quizLines').and.returnValue(signal(initialQuizLines));
      questionServiceSpy.getApiQuestions.and.returnValue(of(newApiQuestions));

      service.changeQuizLine(initialQuizLines[0])
      .pipe(
        tap((apiQuestion) => {
          expect(apiQuestion.question).toBe(newApiQuestions[0].question);
        })
      )
      .subscribe();
    });
  });

  describe('showQuizResults', () => {
    it('should navigate to quiz result page', () => {
      service.showQuizResults();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/result']);
    });
  });

  describe('createNewQuiz', () => {
    it('should reset the quiz maker state and navigate to home page', () => {
      service.createNewQuiz();
      expect(quizMakerStateServiceSpy.reset).toHaveBeenCalledWith('quizLines');
      expect(quizMakerStateServiceSpy.reset).toHaveBeenCalledWith('quizConfig');
      expect(quizMakerStateServiceSpy.reset).toHaveBeenCalledWith('selectedQuizCategory');
      expect(quizMakerStateServiceSpy.reset).toHaveBeenCalledWith('canQuestionBeChanged');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
  });



});