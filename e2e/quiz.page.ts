import { Locator, Page } from "@playwright/test";

export class QuizPage {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get lines(): Locator {
    return this.page.locator('qzm-quiz-line');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('submit-button');
  }

  async pickAnswers(withChange: boolean = false) {

    if(withChange) {
      const firstLine = await this.lines.nth(0);
      const firstLineButtons = await firstLine.getByRole('button');
      const firstChangeButton = await firstLineButtons.last();
      await firstChangeButton.click();
    }

    for(let i = 0; i < await this.lines.count(); i++) {
      const line = await this.lines.nth(i);
      const buttons = await line.getByRole('button');
      await buttons.nth(0).click();
    }
  }

  async submitAnswer() {
    await this.submitButton.click();
  }

  async resolve(withChange: boolean = false) {
    await this.pickAnswers(withChange);
    await this.submitAnswer();
  }

}