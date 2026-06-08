import { Locator, Page } from '@playwright/test';

export class ChatOutputDisplaySection {
  readonly page: Page;
  readonly outputDisplay: Locator;
  readonly infoComponent: Locator;
  readonly infoIcon: Locator;
  readonly infoText: Locator;
  readonly infoSecondaryText: Locator;
  readonly infoSecondaryLink: Locator;
  readonly kickoffButtons: Locator;
  readonly userMessage: Locator;
  readonly promptResponse: Locator;
  readonly loadingAnimation: Locator;
  readonly conversationHistory: Locator;
  readonly initialContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.outputDisplay = this.page.getByRole('main');
    this.infoComponent = this.outputDisplay.locator('div[role="alert"]');
    this.infoIcon = this.infoComponent.locator('> svg');
    this.infoText = this.infoComponent.locator('> div');
    this.infoSecondaryText = this.infoText.locator('div');
    this.infoSecondaryLink = this.infoText.locator('a');
    this.kickoffButtons = this.outputDisplay.getByRole('region', { name: /examples/ }).locator('button');
    this.conversationHistory = this.outputDisplay.getByRole('log');
    this.userMessage = this.conversationHistory.locator('> *').nth(-2);
    this.promptResponse = this.conversationHistory.locator('> *').last();
    this.loadingAnimation = this.outputDisplay.getByText('Loading...');
    this.initialContext = this.outputDisplay.locator('div').filter({ hasText: 'Context from previous session' });
  }
}
