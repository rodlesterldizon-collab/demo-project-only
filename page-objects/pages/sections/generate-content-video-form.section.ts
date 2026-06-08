import { Locator, Page } from '@playwright/test';

export class GenerateContentVideoFormSection {
  readonly page: Page;
  readonly root: Locator;
  readonly form: Locator;
  readonly ideaField: Locator;
  readonly generateButton: Locator;
  readonly aspectRatioGroup: Locator;
  readonly imageUploadInput: Locator;
  readonly imageUploadArea: Locator;
  readonly imageThumbnail: Locator;
  readonly imageDeleteButton: Locator;
  readonly imageRequiredError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.form = this.page.locator('form');
    this.ideaField = this.form.getByLabel('Video idea');
    this.generateButton = this.form.getByRole('button', { name: 'Generate', exact: true });
    this.aspectRatioGroup = this.form.locator('[role="radiogroup"]');

    this.imageUploadInput = this.form.locator('input[type="file"][accept*="image"]');
    this.imageUploadArea = this.form.locator('#image button:has-text("Drag and drop an image")');
    this.imageThumbnail = this.form.locator('#image img[alt]');
    this.imageDeleteButton = this.form.locator('#image button[aria-label="Close"]');
    this.imageRequiredError = this.form.getByText('Either video idea or image is required', { exact: true });
  }

  aspectRatioOption(label: string): Locator {
    return this.aspectRatioGroup.getByRole('radio', { name: label });
  }

  async pressGenerateButton() {
    await this.generateButton.click();
  }
}
