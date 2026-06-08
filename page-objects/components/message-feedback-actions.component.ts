import { expect, Locator, Page } from '@playwright/test';

export class MessageFeedbackActionsComponent {
  readonly page: Page;
  readonly root: Locator | Page;
  readonly goodRatingButton: Locator;
  readonly badRatingButton: Locator;
  readonly goodRatingTooltip: Locator;
  readonly badRatingTooltip: Locator;
  readonly goodRatingIcon: Locator;
  readonly badRatingIcon: Locator;
  readonly feedbackModal: Locator;
  readonly feedbackModalInput: Locator;
  readonly feedbackModalCancel: Locator;
  readonly feedbackModalSubmit: Locator;

  constructor(page: Page, root?: Locator) {
    this.page = page;
    this.root = root ?? page;
    this.goodRatingButton = this.root.getByRole('button', { name: 'Good response' });
    this.badRatingButton = this.root.getByRole('button', { name: 'Bad response' });
    this.goodRatingTooltip = this.root.getByRole('tooltip', { name: 'Good response' });
    this.badRatingTooltip = this.root.getByRole('tooltip', { name: 'Bad response' });
    this.goodRatingIcon = this.goodRatingButton.locator('svg');
    this.badRatingIcon = this.badRatingButton.locator('svg');

    this.feedbackModal = this.page.getByRole('dialog');
    this.feedbackModalInput = this.feedbackModal.locator('textarea');
    this.feedbackModalCancel = this.feedbackModal.getByRole('button', { name: 'Cancel' });
    this.feedbackModalSubmit = this.feedbackModal.getByRole('button', { name: 'Submit' });
  }

  async checkFeedbackActionsVisibility() {
    // NOTE: Tooltip tests are currently excluded due to Playwright difficulties
    await expect(this.goodRatingButton).toBeVisible();
    await expect(this.goodRatingButton).toHaveAttribute('aria-pressed', 'false');

    await expect(this.badRatingButton).toBeVisible();
    await expect(this.badRatingButton).toHaveAttribute('aria-pressed', 'false');
  }

  async checkFeedbackActionsFunctionality() {
    // Test thumbs up interaction
    await this.goodRatingButton.click();
    await expect(this.feedbackModal).toBeVisible();
    // Should be able to close the modal without providing comment feedback
    await this.feedbackModalCancel.click();
    await expect(this.feedbackModal).not.toBeVisible();
    // Original rating should be reflected in the button state
    await expect(this.goodRatingButton).toHaveAttribute('aria-pressed', 'true');

    // Test thumbs down interaction (which will also reset the thumbs up)
    await this.badRatingButton.click();
    await expect(this.feedbackModal).toBeVisible();
    // Should be able to submit comment feedback in the modal
    await this.feedbackModalInput.fill('Test feedback');
    await this.feedbackModalSubmit.click();

    // The rating should be captured, the modal should close, and the original rating should be reflected in the button state
    await expect(this.feedbackModal).not.toBeVisible();
    await expect(this.badRatingButton).toHaveAttribute('aria-pressed', 'true');
    await expect(this.goodRatingButton).toHaveAttribute('aria-pressed', 'false');

    // The rating should be captured in the data layer
    const lastEvent = await this.page.evaluate(() => {
      const win = window as unknown as { dataLayer: Array<{ event: string; feedback?: string; status: boolean }> };
      const dl = win.dataLayer || [];
      return dl[dl.length - 1];
    });
    expect(lastEvent.event).toBe('rate_generation');
    expect(lastEvent.feedback).toBe('Test feedback');
    expect(lastEvent.status).toBe(false);
  }
}
