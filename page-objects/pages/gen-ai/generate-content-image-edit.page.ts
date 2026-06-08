import { expect, Locator, Page } from '@playwright/test';

export class GenerateContentImageEditPage {
  readonly page: Page;
  readonly root: Locator;
  readonly activeImage: Locator;
  readonly loadingSkeleton: Locator;
  readonly quickPromptRadioGroup: Locator;
  readonly regenerateButton: Locator;
  readonly regenerateButtonLoadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.activeImage = this.root.getByAltText('AI generated image');
    this.loadingSkeleton = this.root.locator('div.animate-pulse');
    this.quickPromptRadioGroup = this.root.getByRole('radiogroup');
    this.regenerateButton = this.root.getByRole('button', { name: 'Regenerate' });
    this.regenerateButtonLoadingSpinner = this.regenerateButton.locator('svg[class*="animate-spin"]');
  }

  async selectQuickPromptOption(optionName: string) {
    await expect(this.quickPromptRadioGroup).toBeVisible();
    await this.quickPromptRadioGroup.getByRole('radio', { name: optionName, exact: true }).click();
  }
}
