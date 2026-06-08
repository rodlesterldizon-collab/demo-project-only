import { Locator, Page } from '@playwright/test';
import { Combobox } from '@pageObjects/components/combobox.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class LocalizationGenerateFormSection {
  readonly page: Page;
  readonly root: Locator;
  readonly generateButton: Locator;
  readonly form: Locator;
  readonly formUpdateResult: Locator;
  readonly headline: Locator;
  readonly productDetail: Locator;
  readonly brandPicker: Combobox;
  readonly seasonPicker: Combobox;
  readonly audiencePicker: Combobox;
  readonly occasionPicker: Combobox;
  readonly locationPicker: Combobox;
  readonly textareaAdditionalInstruction: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.locator('main');
    this.form = this.root.locator('form').nth(0);
    this.formUpdateResult = this.root.locator('form').nth(1);
    this.headline = this.root.getByText(APPS_DETAILS.LOCALIZATION.label);
    this.productDetail = this.form.getByLabel('Product Details');
    this.generateButton = this.form.locator('button[type="submit"]').getByText('Generate');
    this.brandPicker = new Combobox(this.form, { name: 'Brand' });
    this.seasonPicker = new Combobox(this.form, { name: 'Season' });
    this.audiencePicker = new Combobox(this.form, { name: 'Audience' });
    this.occasionPicker = new Combobox(this.form, { name: 'Occasion' });
    this.locationPicker = new Combobox(this.form, { name: 'Locations' });
    this.textareaAdditionalInstruction = this.form.getByRole('textbox', { name: 'Additional Instructions' });
  }

  async pressGenerateButton(): Promise<void> {
    await this.generateButton.click();
  }
}
