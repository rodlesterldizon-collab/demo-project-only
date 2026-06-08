import { Locator, Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { CulturalCompassReview } from '@pageObjects/components/cultural-compass-review.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class CulturalCompassMonitoringPage extends genAiBasePage {
  readonly root: Locator;
  readonly logo: Locator;
  readonly title: Locator;
  readonly reviewList: Locator;
  readonly reviewItem: Locator;
  readonly pageList: Locator;

  constructor(page: Page) {
    super(page);
    this.root = this.page.getByRole('main');
    this.logo = this.page.getByAltText('Inclusive Marketing Logo');
    this.title = this.root.getByRole('heading', { level: 1 });
    this.reviewList = this.root.getByRole('list').first();
    this.reviewItem = this.reviewList.getByRole('listitem');
    this.pageList = this.root.getByRole('navigation');
  }

  async goto() {
    await this.page.goto(`${APPS_DETAILS.CULTURAL_COMPASS.url}/monitoring`);
  }

  getReviewRecord(index: number): CulturalCompassReview {
    return new CulturalCompassReview(this.reviewItem.nth(index));
  }
}
