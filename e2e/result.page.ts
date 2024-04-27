import { Locator, Page } from "@playwright/test";

export class ResultPage {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get newQuizButton(): Locator {
    return this.page.getByTestId('reset-button');
  }

  async createNewQuiz() {
    await this.newQuizButton.click();
  }

}