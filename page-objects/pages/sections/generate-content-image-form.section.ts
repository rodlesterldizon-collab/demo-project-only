import { Locator, Page } from '@playwright/test';

export class GenerateContentImageFormSection {
  readonly page: Page;
  readonly root: Locator;
  readonly form: Locator;
  readonly ideaField: Locator;
  readonly excludeField: Locator;
  readonly sizeRadioGroup: Locator;
  readonly sizeRadioButton: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.form = this.page.locator('form');
    this.ideaField = this.form.getByLabel('Image idea');
    this.excludeField = this.form.getByRole('textbox', { name: 'ExcludeOptional' });
    this.sizeRadioGroup = this.page.getByRole('radiogroup');
    this.sizeRadioButton = this.sizeRadioGroup.getByRole('radio');
    this.generateButton = this.form.getByRole('button', { name: 'Generate', exact: true });
  }

  async pressGenerateButton() {
    await this.generateButton.click();
  }
}
