import { Page } from '@playwright/test';

export class OnboardingModalComponent {
  constructor(
    private page: Page,
    private completeButtonLabel: string,
    private disclaimerLabel?: string
  ) {}

  public get container() {
    return this.page.getByRole('dialog');
  }

  public get title() {
    return this.container.getByRole('heading');
  }

  public get closeButton() {
    return this.container.getByLabel('Close');
  }

  public get skipButton() {
    return this.container.getByRole('button', { name: 'Skip' });
  }

  public get backButton() {
    return this.container.getByRole('button', { name: 'Back' });
  }

  public get nextButton() {
    return this.container.getByRole('button', { name: 'Next' });
  }

  public get completeButton() {
    return this.container.getByRole('button', { name: this.completeButtonLabel });
  }

  public get disclaimer() {
    return this.disclaimerLabel ? this.container.getByText(this.disclaimerLabel) : null;
  }

  public get progressCounter() {
    return this.container.getByLabel('onboarding progress').getByRole('listitem');
  }

  public get numOfPages() {
    return this.progressCounter.count().then((count) => count);
  }

  public async clickOutside() {
    const modalBoundingBox = await this.container.boundingBox();
    await this.page.mouse.click((modalBoundingBox?.x || 0) - 20, (modalBoundingBox?.y || 0) - 20);
  }

  public async getActivePageIndex() {
    const progressCounters = await this.progressCounter.all();

    let activePage = 0;
    for await (const [index, counter] of progressCounters.entries()) {
      const currentAttr = await counter.getAttribute('aria-current');
      if (currentAttr === 'step') {
        activePage = index;
        break;
      }
    }

    return activePage;
  }

  public async moveToPreviousPage() {
    const activePageIdx = await this.getActivePageIndex();
    if (activePageIdx > 0) {
      await this.backButton.click();
    } else if (activePageIdx === 0) {
      await this.skipButton.click();
    }
  }

  public async moveToNextPage() {
    const pagesCount = await this.numOfPages;
    const activePageIdx = await this.getActivePageIndex();
    if (activePageIdx < pagesCount - 1) {
      await this.nextButton.click();
    } else if (activePageIdx === pagesCount - 1) {
      await this.completeButton.click();
    }
  }

  public async completeOnboarding() {
    const pagesCount = await this.numOfPages;
    for (let i = 0; i < pagesCount; i++) {
      await this.moveToNextPage();
    }
  }
}
