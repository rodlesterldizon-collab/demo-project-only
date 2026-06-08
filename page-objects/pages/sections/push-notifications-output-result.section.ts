import { Locator, Page } from '@playwright/test';

export class PushNotificationsOutputResultSection {
  readonly page: Page;
  readonly root: Locator;
  readonly loadingAnimation: Locator;
  readonly result: Locator;
  readonly resultHeadline: Locator;
  readonly resultComponentBreakdown: Locator;
  readonly headlineComponentBreakdown: Locator;
  readonly headlineContentComponentBreakdown: Locator;
  readonly bodyComponentBreakdown: Locator;
  readonly bodyContentComponentBreakdown: Locator;
  readonly resultReasoningBreakdown: Locator;
  readonly exportButton: Locator;
  readonly updateButton: Locator;
  readonly feedback: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.loadingAnimation = page.getByText('Generating content...');
    this.result = this.root.locator('li');
    this.resultHeadline = this.result.getByRole('heading', { level: 4 });
    this.resultComponentBreakdown = this.result.getByRole('heading', { level: 3 }).getByText('Component Breakdown');
    this.headlineComponentBreakdown = this.result.getByText('Headline', { exact: true });
    this.headlineContentComponentBreakdown = this.headlineComponentBreakdown.locator('+ p');
    this.bodyComponentBreakdown = this.result.getByText('Body');
    this.bodyContentComponentBreakdown = this.bodyComponentBreakdown.locator('+ p');
    this.resultReasoningBreakdown = this.result.getByRole('heading', { level: 3 }).getByText('Reasoning Breakdown');
    this.exportButton = this.root.getByRole('button', { name: 'Export CSV' });
    this.updateButton = this.root.getByRole('button', { name: 'Update' });
    this.feedback = this.root.locator('label').getByText('Feedback');
  }
}
