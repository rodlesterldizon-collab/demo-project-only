import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { Combobox } from '@pageObjects/components/combobox.component';
import { Locator, Page } from '@playwright/test';

export class ConceptInnovationGenerateFormSection {
  readonly page: Page;
  readonly root: Locator;
  readonly pageHeading: Locator;
  readonly form: Locator;
  readonly resetButton: Locator;
  readonly generateButton: Locator;
  readonly ideaStatementField: Locator;
  readonly ideaStatementDescription: Locator;
  readonly ideaStatementError: Locator;
  readonly generateIdeaStatementButton: Locator;
  readonly generateIdeaStatementLoading: Locator;
  readonly negativePromptField: Locator;
  readonly brandPicker: Combobox;
  readonly imageStyleRadioGroup: Locator;
  readonly imageStyleRadioButtons;
  readonly imageStyleText: Locator;
  readonly customImageStyleButton: Locator;
  readonly customImageStyleInput: Locator;
  readonly productPackagingPicker: Combobox;
  readonly packagingUploadLabel: Locator;
  readonly packagingUploadField: Locator;
  readonly packagingUploadTooltipIcon: Locator;
  readonly packagingUploadTooltip: Locator;
  readonly packagingUploadMoreButton: Locator;
  readonly packagingUploadedThumbnail: Locator;
  readonly packagingUploadedThumbnailCloseButton: Locator;
  readonly customBrandButton: Locator;
  readonly customBrandInputTitle: Locator;
  readonly customBrandInputHoverIcon: Locator;
  readonly customBrandInput: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.pageHeading = this.root.getByRole('heading', { name: APPS_DETAILS.PRODUCT_CONCEPTS.label });
    this.form = this.page.locator('form').nth(0);
    this.ideaStatementField = this.form.getByLabel('Concept idea');
    this.ideaStatementDescription = this.form.getByText('Tell us your basic idea');
    this.ideaStatementError = this.form.locator(':below(:text("Concept idea"))').getByText('Concept idea is required');
    this.generateIdeaStatementButton = this.form.getByRole('button', { name: 'Generate idea' });
    this.generateIdeaStatementLoading = this.form.getByRole('button', { name: 'Generating idea...' });
    this.negativePromptField = this.form.getByLabel('Exclude');
    this.brandPicker = new Combobox(this.form, { name: 'Brand' });
    this.imageStyleRadioGroup = this.form.locator('[id="imageStyle"]');
    this.imageStyleRadioButtons = this.imageStyleRadioGroup.getByRole('radio');
    this.imageStyleText = this.imageStyleRadioGroup.locator('label');
    this.customImageStyleButton = this.form.getByRole('radio', { name: 'Create image style' });
    this.customImageStyleInput = this.form.locator('input[name="customImageStyle"]');
    this.productPackagingPicker = new Combobox(this.form, { name: 'Product packaging' });
    this.packagingUploadLabel = this.form.getByText('Packaging reference images').locator('..');
    this.packagingUploadField = this.form.locator('[id="packageReferenceImages"]');
    this.packagingUploadTooltipIcon = this.packagingUploadLabel.getByRole('img');
    this.packagingUploadTooltip = this.packagingUploadLabel.getByRole('tooltip');
    this.packagingUploadMoreButton = this.packagingUploadField.getByRole('button', {
      name: 'Drag and drop an image or browse',
    });
    this.packagingUploadedThumbnail = this.packagingUploadField.locator('img');
    this.packagingUploadedThumbnailCloseButton = this.packagingUploadField.getByRole('button', { name: 'Close' });
    this.customBrandButton = this.form.getByRole('button', { name: 'Create Custom Brand' });
    this.customBrandInputTitle = this.form.getByText('Create custom brand');
    this.customBrandInputHoverIcon = this.customBrandInputTitle.locator('..').getByRole('img');
    this.customBrandInput = this.form.getByLabel('Create custom brand');
    this.generateButton = this.form.getByRole('button', { name: 'Generate', exact: true });
    this.resetButton = this.form.getByRole('button', { name: 'Reset' });
    this.errorToast = this.page.locator('span[role="status"]');
  }

  async selectRandomPresetImageStyle(): Promise<string> {
    const radioOptions = this.imageStyleRadioGroup.getByRole('radio');

    // Only pick preset image styles
    const randomIndex = Math.floor(Math.random() * 3);
    const selectedRadioOption = radioOptions.nth(randomIndex);
    const imageStyleName = await selectedRadioOption.textContent();
    await selectedRadioOption.click();
    return imageStyleName || '';
  }

  async pressGenerateButton(): Promise<void> {
    await this.generateButton.click();
  }
}
