import { Locator, Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { CulturalCompassSendForReviewSection } from '../sections/cultural-compass-send-for-review.section';
import { CulturalCompassResultsSection } from '../sections/cultural-compass-results.section';
import { UndoDeletedReviewComponent } from '@pageObjects/components/undo-deleted-review.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class CulturalCompassPage extends genAiBasePage {
  readonly heading: Locator;
  readonly sendForReviewSection: CulturalCompassSendForReviewSection;
  readonly resultsSection: CulturalCompassResultsSection;
  readonly modal: Locator;
  readonly undoDeletedReview: UndoDeletedReviewComponent;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: APPS_DETAILS.CULTURAL_COMPASS.label });
    this.sendForReviewSection = new CulturalCompassSendForReviewSection(page);
    this.resultsSection = new CulturalCompassResultsSection(page);
    this.modal = this.page.getByRole('dialog');
    this.undoDeletedReview = new UndoDeletedReviewComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.CULTURAL_COMPASS.url);
  }
}
