import { Locator, Page } from '@playwright/test';

export class LocalizationResultAndUpdateFormSection {
  readonly page: Page;
  readonly root: Locator;
  readonly form: Locator;
  readonly locationResultHeading: Locator;
  readonly resultComponentBreakdown: Locator;
  readonly resultReasoningBreakdown: Locator;
  readonly resultComponentHeading: Locator;
  readonly resultComponentSubheading: Locator;
  readonly resultComponentCta: Locator;
  readonly resultComponentRecommendedProducts: Locator;
  readonly resultReasoningGeneral: Locator;
  readonly resultReasoningLocale: Locator;
  readonly resultReasoningSeason: Locator;
  readonly resultReasoningProduct: Locator;
  readonly exportButton: Locator;
  readonly updateButton: Locator;
  readonly feedback: Locator;
  readonly generationContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.generationContainer = this.root.locator('li');
    this.form = this.page.locator('form').nth(1);
    this.locationResultHeading = this.page.locator('h4');
    this.resultComponentBreakdown = this.generationContainer.getByText('Component Breakdown');
    this.resultReasoningBreakdown = this.generationContainer.getByText('Reasoning Breakdown');
    this.resultComponentHeading = this.generationContainer.getByText('Heading');
    this.resultComponentSubheading = this.generationContainer.getByText('Subheading');
    this.resultComponentCta = this.generationContainer.getByText('Cta');
    this.resultComponentRecommendedProducts = this.generationContainer.getByText('Recommended Products');
    this.resultReasoningGeneral = this.generationContainer.locator('div > p:text-is("General")');
    this.resultReasoningLocale = this.generationContainer.locator('div > p:text-is("Locale")');
    this.resultReasoningSeason = this.generationContainer.locator('div > p:text-is("Season")');
    this.resultReasoningProduct = this.generationContainer.locator('div > p:text-is("Product")');
    this.exportButton = this.page.locator('button').getByText('Export CSV');
    this.updateButton = this.page.locator('button').getByText('Update');
    this.feedback = this.form.locator('label').getByText('Feedback');
  }

  async pressExportButton(): Promise<void> {
    await this.exportButton.click();
  }
  async pressUpdateButton(): Promise<void> {
    await this.updateButton.click();
  }
}
