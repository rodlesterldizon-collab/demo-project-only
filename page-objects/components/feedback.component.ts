import { Locator, Page } from '@playwright/test';

export class FeedbackComponent {
  readonly page: Page;
  readonly link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.link = this.page.getByRole('link', { name: 'Provide Feedback' });
  }
}
