import { Page } from 'playwright-core';
import { genAiBasePage } from '@pageObjects/pages/gen-ai/base.page';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { GenerateContentVideoFormSection } from '@pageObjects/pages/sections/generate-content-video-form.section';

export class GenerateContentVideoPage extends genAiBasePage {
  readonly formSection: GenerateContentVideoFormSection;

  constructor(page: Page) {
    super(page);
    this.formSection = new GenerateContentVideoFormSection(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.CONTENT_VIDEO.url, { waitUntil: 'domcontentloaded' });
  }
}
