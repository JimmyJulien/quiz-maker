import { expect, test } from '@playwright/test';
import { CATEGORIES } from './data/categories.data';
import { NEW_QUESTIONS, QUESTIONS } from './data/questions.data';
import { HomePage } from './pages/home.page';
import { QuizPage } from './pages/quiz.page';
import { ResultPage } from './pages/result.page';

const SERVER_URL = 'http://localhost:4200';
const HOME_URL = `${SERVER_URL}/home`;
const QUIZ_URL = `${SERVER_URL}/quiz`;
const RESULT_URL = `${SERVER_URL}/result`;


test('play a full quiz game without changing a question (mocked api calls)', async ({ page }) => {
  // Mock categories fetching
  await page.route(
    'https://opentdb.com/api_category.php',
    route => route.fulfill({ json: CATEGORIES })
  );

  // Mock questions fetching
  await page.route(
    'https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple',
    route => route.fulfill({ json: QUESTIONS })
  );

  // Create Home page
  const home = new HomePage(page);

  // Go on Home page
  await home.goto();

  // Create a quiz
  await home.createQuiz();
  
  // Check navigation to Quiz page
  await expect(page).toHaveURL(QUIZ_URL);

  // Create Quiz page
  const quiz = new QuizPage(page);

  // Resolve the quiz
  await quiz.resolve();

  // Check navigation to Result page
  await expect(page).toHaveURL(RESULT_URL);

  // Create Result page
  const result = new ResultPage(page);

  // Launch new quiz
  result.createNewQuiz();

  // Check navigation to Home page
  await expect(page).toHaveURL(HOME_URL);
});

test('play a full quiz game with a question change (mocked api calls)', async ({ page }) => {
  // Mock categories fetching
  await page.route(
    'https://opentdb.com/api_category.php',
    route => route.fulfill({ json: CATEGORIES })
  );
  
  // Mock questions fetching
  await page.route(
    'https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple',
    route => route.fulfill({ json: QUESTIONS })
  );

  // Mock new questions fetching
  await page.route(
    'https://opentdb.com/api.php?amount=6&category=9&difficulty=easy&type=multiple',
    route => route.fulfill({ json: NEW_QUESTIONS })
  );
  
  // Create Home page
  const home = new HomePage(page);

  // Go on Home page
  await home.goto();

  // Create a quiz
  await home.createQuiz();
  
  // Check navigation to Quiz page
  await expect(page).toHaveURL(QUIZ_URL);

  // Create Quiz page
  const quiz = new QuizPage(page);

  // Resolve the quiz
  await quiz.resolve(true);

  // Check navigation to Result page
  await expect(page).toHaveURL(RESULT_URL);

  // Create Result page
  const result = new ResultPage(page);

  // Launch new quiz
  result.createNewQuiz();

  // Check navigation to Home page
  await expect(page).toHaveURL(HOME_URL);
});
