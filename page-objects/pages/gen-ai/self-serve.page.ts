import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { ChatInputFormSection } from '../sections/self-serve-chat-input.section';
import { ChatOutputDisplaySection } from '../sections/self-serve-display-output.section';
import { FeedbackComponent } from '@pageObjects/components/feedback.component';
import { RefreshToastComponent } from '@pageObjects/components/refresh-toast.component';
import { RestartSessionDialogComponent } from '@pageObjects/components/restart-session-dialog.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

export class SelfServePage extends genAiBasePage {
  readonly chatInputFormSection: ChatInputFormSection;
  readonly chatOutputDisplaySection: ChatOutputDisplaySection;
  readonly feedbackComponent: FeedbackComponent;
  readonly refreshToastComponent: RefreshToastComponent;
  readonly restartSessionDialogComponent: RestartSessionDialogComponent;

  constructor(page: Page) {
    super(page);
    this.chatInputFormSection = new ChatInputFormSection(page);
    this.chatOutputDisplaySection = new ChatOutputDisplaySection(page);
    this.feedbackComponent = new FeedbackComponent(page);
    this.refreshToastComponent = new RefreshToastComponent(page);
    this.restartSessionDialogComponent = new RestartSessionDialogComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.SELF_SERVE.url, { waitUntil: 'domcontentloaded' });
  }
}
