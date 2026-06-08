import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { SegmentationGenerateFormSection } from '../sections/segmentation-generate-form.section';
import { FeedbackComponent } from '@pageObjects/components/feedback.component';

export class SegmentationPage extends genAiBasePage {
  readonly generateFormSection: SegmentationGenerateFormSection;
  readonly feedbackComponent: FeedbackComponent;

  constructor(page: Page) {
    super(page);
    this.generateFormSection = new SegmentationGenerateFormSection(page);
    this.feedbackComponent = new FeedbackComponent(page);
  }

  async goto() {
    await this.page.goto('/segments', { waitUntil: 'domcontentloaded' });
  }
}
