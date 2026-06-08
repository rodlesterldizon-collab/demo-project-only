import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { LocalizationGenerateFormSection } from '../sections/localization-generate-form.section';
import { LocalizationResultAndUpdateFormSection } from '../sections/localization-result-and-update-form.section';
import { PromptConsoleDrawerSection } from '../sections/prompt-console';
import { FeedbackComponent } from '@pageObjects/components/feedback.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class LocalizationPage extends genAiBasePage {
  readonly generateFormSection: LocalizationGenerateFormSection;
  readonly resultAndUpdateFormSection: LocalizationResultAndUpdateFormSection;
  readonly promptConsoleSection: PromptConsoleDrawerSection;
  readonly feedbackComponent: FeedbackComponent;

  constructor(page: Page) {
    super(page);
    this.generateFormSection = new LocalizationGenerateFormSection(page);
    this.resultAndUpdateFormSection = new LocalizationResultAndUpdateFormSection(page);
    this.promptConsoleSection = new PromptConsoleDrawerSection(page);
    this.feedbackComponent = new FeedbackComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.LOCALIZATION.url, { waitUntil: 'domcontentloaded' });
  }
}
