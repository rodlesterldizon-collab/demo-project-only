import { Locator, Page } from '@playwright/test';

export class RestartSessionDialogComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly summaryLoading: Locator;
  readonly cancelButton: Locator;
  readonly newChatButton: Locator;
  readonly useSummaryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = this.page.getByRole('dialog').filter({ hasText: 'Restart session' });
    this.summaryLoading = this.container.getByText('Creating summary');
    this.cancelButton = this.container.locator('button').getByText('Cancel');
    this.newChatButton = this.container.locator('button').getByText('New Chat');
    this.useSummaryButton = this.container.locator('button').getByText('Use summary');
  }
}
