import { Locator, Page } from '@playwright/test';

export class RefreshToastComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly restartButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = this.page.getByRole('region', { name: 'Notifications' }).getByRole('status').filter({
      hasText: 'Your session is getting long, which may slow down performance. Restart for better speed, if needed.',
    });
    this.restartButton = this.container.locator('button').getByText('Restart');
    this.closeButton = this.container.getByRole('button', { name: 'Dismiss' });
  }
}
