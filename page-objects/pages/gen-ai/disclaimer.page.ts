import { Page, Locator } from '@playwright/test';

export class DisclaimerPage {
  readonly page: Page;
  readonly tasteMakerImg: Locator;
  readonly disclaimerText: Locator;
  readonly disclaimerParagraphs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tasteMakerImg = page.getByRole('img', {
      name: 'TasteMaker logo and word mark',
    });
    this.disclaimerText = page.locator('p', { hasText: 'Disclaimer' });
    this.disclaimerParagraphs = page.locator('div >> p');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
