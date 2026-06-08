import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { Combobox } from '@pageObjects/components/combobox.component';
import { Locator, Page } from '@playwright/test';

export class PushNotificationsGenerateFormSection {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly form: Locator;
  readonly perSegmentRadioButton: Locator;
  readonly perDemographicRadioButton: Locator;
  readonly brandPicker: Combobox;
  readonly seasonPicker: Combobox;
  readonly audiencePicker: Combobox;
  readonly demographicPicker: Combobox;
  readonly segmentsPicker: Combobox;
  readonly placeholdersPicker: Combobox;
  readonly emojiToggle: Locator;
  readonly includeHeadlineToggle: Locator;
  readonly includeRecipeToggle: Locator;
  readonly groundingQueryTextBox: Locator;
  readonly purposeTextArea: Locator;
  readonly purposeTextAreaWarning: Locator;
  readonly additionalInstructionsTextArea: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = this.page.getByRole('heading', { name: APPS_DETAILS.CRM.label });
    this.form = page.locator('form').first();
    this.perSegmentRadioButton = this.form.getByRole('radio', { name: 'Per Segment' });
    this.perDemographicRadioButton = this.form.getByRole('radio', { name: 'Per Demographic' });
    this.brandPicker = new Combobox(this.form, { name: 'Brand' });
    this.seasonPicker = new Combobox(this.form, { name: 'Season' });
    this.audiencePicker = new Combobox(this.form, { name: 'Audience' });
    this.demographicPicker = new Combobox(this.form, { name: 'Demographic' });
    this.segmentsPicker = new Combobox(this.form, { name: 'Segments' });
    this.placeholdersPicker = new Combobox(this.form, { name: 'Placeholders' });
    this.emojiToggle = this.form.getByLabel('Include Emojis');
    this.includeHeadlineToggle = this.form.getByLabel('Include Headline');
    this.includeRecipeToggle = this.form.getByLabel('Include Recipe');
    this.groundingQueryTextBox = this.form.getByRole('textbox', { name: 'Grounding Query' });
    this.purposeTextArea = this.form.getByRole('textbox', { name: 'Push Notification Purpose' });
    this.purposeTextAreaWarning = this.form
      .locator(':below(:text("Push Notification Purpose"))')
      .getByText('Field must not be empty');
    this.additionalInstructionsTextArea = this.form.getByRole('textbox', { name: 'Additional Instructions' });
    this.generateButton = this.form.getByRole('button', { name: 'Generate' });
  }
}
