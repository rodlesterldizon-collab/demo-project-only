import { Locator, Page } from '@playwright/test';

export class DownloadImageComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly button: Locator;
  readonly tooltip: Locator;
  readonly loaderIndicator: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page, container: Locator) {
    this.page = page;
    this.container = container;
    this.button = this.container.getByRole('button', { name: 'Download (Hi-Res)' });
    this.tooltip = this.container.getByRole('tooltip', { name: 'Download (Hi-Res)' });
    this.loaderIndicator = this.container.getByRole('progressbar');
    this.toastMessage = this.page
      .getByLabel('Notifications')
      .getByRole('status')
      .filter({ hasText: 'Downloading Hi-Res Image...' });
  }

  async clickDownload() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.button.click();
    return downloadPromise.then((download) => ({ filename: download.suggestedFilename() }));
  }
}
