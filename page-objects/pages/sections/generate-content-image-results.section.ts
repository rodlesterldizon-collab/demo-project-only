import { Locator, Page } from '@playwright/test';

export class GenerateContentImageResultsSection {
  readonly page: Page;
  readonly root: Locator;
  readonly imageSizeTitle: Locator;
  readonly imageSize: Locator;
  readonly regenerateButton: Locator;
  readonly loadingImagesAnimation: Locator;
  readonly imageContainer: Locator;
  readonly image: Locator;
  readonly editButton: Locator;
  readonly ideaTitle: Locator;
  readonly ideaValue: Locator;
  readonly excludeTitle: Locator;
  readonly excludeValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.getByRole('main');
    this.imageSizeTitle = this.page.getByRole('heading', { name: 'Image size', level: 4 });
    this.imageSize = this.imageSizeTitle.locator('~ p');
    this.ideaTitle = this.page.getByRole('heading', { name: 'Image idea', level: 4 });
    this.ideaValue = this.ideaTitle.locator('~ p');
    this.excludeTitle = this.page.getByRole('heading', { name: 'Exclude', level: 4 });
    this.excludeValue = this.excludeTitle.locator('~ p');
    this.regenerateButton = this.page.getByRole('button', { name: ' Regenerate all images' });
    this.loadingImagesAnimation = this.page.getByText('Generation in progress');
    this.image = this.page.getByAltText('AI generated image');
    this.imageContainer = this.page
      .getByRole('link')
      .filter({ has: this.page.getByAltText('AI generated image') })
      .locator('..');
    this.editButton = this.page.getByRole('link', { name: 'Edit' });
  }
}
