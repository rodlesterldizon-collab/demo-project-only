import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { GenerateContentImageResultsSection } from '../sections/generate-content-image-results.section';
import { GenerateContentImageFormSection } from '../sections/generate-content-image-form.section';
import { CopyShareableLinkComponent } from '@pageObjects/components/copy-shareable-link.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class GenerateContentImagePage extends genAiBasePage {
  readonly formSection: GenerateContentImageFormSection;
  readonly resultsSection: GenerateContentImageResultsSection;
  readonly copyPageLinkComponent: CopyShareableLinkComponent;

  constructor(page: Page) {
    super(page);
    this.formSection = new GenerateContentImageFormSection(page);
    this.resultsSection = new GenerateContentImageResultsSection(page);
    this.copyPageLinkComponent = new CopyShareableLinkComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.CONTENT_IMAGE.url, { waitUntil: 'domcontentloaded' });
  }
}
