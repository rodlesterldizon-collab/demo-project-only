import { Page, Locator, expect } from '@playwright/test';

export class ErrorPage {
  readonly page: Page;
  readonly errorTitle: Locator;
  readonly errorDescription: Locator;
  readonly goHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.errorTitle = page.getByRole('heading', { name: /Oops! We couldn't find that page/i });
    this.errorDescription = page.getByText(/Looks like the page you're looking for has gone on a little adventure/i);
    this.goHomeButton = page.getByRole('link', { name: /Go home/i });
  }

  async gotoInvalidPage() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.status() >= 400 && response.status() < 500
    );
    await this.page.goto('/conceptTravel', { waitUntil: 'domcontentloaded' });
    const response = await responsePromise;

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  }

  async clickGoHome() {
    await this.goHomeButton.click();
  }

  async expectErrorElementsVisible() {
    await expect(this.errorTitle).toBeVisible();
    await expect(this.errorDescription).toBeVisible();
    await expect(this.goHomeButton).toBeVisible();
  }
}
