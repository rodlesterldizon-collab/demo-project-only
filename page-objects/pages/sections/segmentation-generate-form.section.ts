import { Locator, Page } from '@playwright/test';

export class SegmentationGenerateFormSection {
  readonly page: Page;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = this.page.getByRole('heading', { name: 'Create micro-segments' });
  }
}
