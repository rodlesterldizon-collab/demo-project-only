import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { PushNotificationsGenerateFormSection } from '../sections/push-notifications-generate-form.section';
import { PushNotificationsOutputResultSection } from '../sections/push-notifications-output-result.section';
import { FeedbackComponent } from '@pageObjects/components/feedback.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class PushNotificationsPage extends genAiBasePage {
  readonly generateFormSection: PushNotificationsGenerateFormSection;
  readonly outputResultSection: PushNotificationsOutputResultSection;
  readonly feedbackComponent: FeedbackComponent;

  constructor(page: Page) {
    super(page);
    this.generateFormSection = new PushNotificationsGenerateFormSection(page);
    this.outputResultSection = new PushNotificationsOutputResultSection(page);
    this.feedbackComponent = new FeedbackComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.CRM.url, { waitUntil: 'domcontentloaded' });
  }
}
