import { Locator, Page } from '@playwright/test';

export class LoadingScreenComponent {
  readonly root: Page | Locator;
  readonly progressBar: Locator;
  readonly loadingScreenAnimation: Locator;
  readonly loadingScreenTip: Locator;

  constructor(root: Page | Locator) {
    this.root = root;
    this.progressBar = this.root.getByRole('progressbar');
    this.loadingScreenAnimation = this.progressBar.locator('canvas');
    this.loadingScreenTip = this.progressBar.getByText(/^Tip:/);
  }
}
