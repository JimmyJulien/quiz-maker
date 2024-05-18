import { Page } from "@playwright/test";

export class HomePage {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get categoryInput() {
    return this.page.getByTestId('category-input');
  }

  get subcategoryInput() {
    return this.page.getByTestId('subcategory-input');
  }

  get difficultySelect() {
    return this.page.getByTestId('difficulty-select');
  }

  get createButton() {
    return this.page.getByTestId('create-button');
  }

  async goto() {
    await this.page.goto('http://localhost:4200/home');
  }

  async selectCategory() {
    await this.categoryInput.click();
    const categories = await this.categoryInput.locator('.option');
    await categories.nth(0).click();
  }
  
  async selectDifficulty() {
    await this.difficultySelect.click();
    const difficulties = await this.difficultySelect.locator('.option');
    await difficulties.nth(0).click();
  }

  async selectSubcategory() {
    await this.subcategoryInput.click();
    await this.page.getByText('Books').click();
  }

  async launchQuizCreation() {
    await this.createButton.click();
  }

  async createQuiz() {
    await this.selectCategory();
    await this.selectDifficulty();
    await this.launchQuizCreation();
  }
}