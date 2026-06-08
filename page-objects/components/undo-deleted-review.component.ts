import { Locator, Page } from '@playwright/test';

export class UndoDeletedReviewComponent {
  readonly page: Page;
  readonly toastMessage: Locator;
  readonly toastUndoButton: Locator;
  readonly toastDismissButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastMessage = this.page
      .getByLabel('Notifications')
      .getByRole('status')
      .filter({ hasText: 'Review Successfully removed' });
    this.toastUndoButton = this.toastMessage.getByRole('button', { name: 'Undo' });
    this.toastDismissButton = this.toastMessage.getByRole('button', { name: 'Dismiss' });
  }
}
