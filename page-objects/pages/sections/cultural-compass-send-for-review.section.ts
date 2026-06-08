import { Locator, Page } from '@playwright/test';

export class CulturalCompassSendForReviewSection {
  readonly page: Page;
  readonly form: Locator;
  readonly contentInput: Locator;
  readonly uploadedImage: Locator;
  readonly uploadedText: Locator;
  readonly uploadFilesButton: Locator;
  readonly submitTextContent: Locator;
  readonly evaluationFocusPicker: Locator;
  readonly evaluationFocusInput: Locator;
  readonly evaluationFocusSelectedOption: Locator;
  readonly evaluationFocusRemoveButton: Locator;
  readonly evaluationFocusListboxOption: Locator;
  readonly bundleContentCheckbox: Locator;
  readonly sendForReviewButton: Locator;
  readonly editModalTitle: Locator;
  readonly editTextArea: Locator;
  readonly saveEditButton: Locator;
  readonly alertIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = this.page.locator('form');
    this.contentInput = this.form.getByLabel('Content Input');
    this.uploadedImage = this.form.locator('img');
    this.uploadedText = this.form.locator('button[aria-haspopup="dialog"]');
    this.uploadFilesButton = this.form.getByLabel('Upload files');
    this.submitTextContent = this.form.getByLabel('Submit text content');
    this.evaluationFocusPicker = this.form.locator('[id="evaluationFocus"]');
    this.evaluationFocusInput = this.evaluationFocusPicker.getByRole('combobox');
    this.evaluationFocusSelectedOption = this.evaluationFocusPicker.locator('div[class*="multiValue"]');
    this.evaluationFocusRemoveButton = this.evaluationFocusPicker.locator('div[role="button"]');
    this.evaluationFocusListboxOption = this.evaluationFocusPicker.locator('div[role="option"]');
    this.bundleContentCheckbox = this.form.getByLabel('Bundle Content');
    this.sendForReviewButton = this.form.locator('button[type="submit"]').getByText('Send for review');
    this.editModalTitle = this.page.getByRole('heading', { name: 'Edit content' });
    this.editTextArea = this.page.locator('textarea[name="textContent"]');
    this.saveEditButton = this.page.getByRole('button', { name: 'Save changes' });
    this.alertIcon = this.form.locator('svg.lucide-triangle-alert');
  }

  removeAttachedTextContent = async (content: string) => {
    const contentContainer = this.form.getByRole('button', { name: content }).locator('..');
    const removeButton = contentContainer.getByRole('button', { name: 'remove' });
    await removeButton.click();
  };

  selectRandomInclusivityFocus = async () => {
    await this.evaluationFocusPicker.click();
    const optionCount = await this.evaluationFocusListboxOption.count();
    const randomIndex = Math.floor(Math.random() * optionCount);
    const selectedOption = this.evaluationFocusListboxOption.nth(randomIndex);
    const selectedFocus = (await selectedOption.textContent()) || '';
    await selectedOption.click();
    await this.page.keyboard.press('Escape');

    return { selectedFocus };
  };
}
