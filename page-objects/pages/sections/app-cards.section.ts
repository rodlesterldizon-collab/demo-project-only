import { Locator, Page } from '@playwright/test';
import { AppCard } from '@pageObjects/components/app-card.component';

export class AppCardsSection {
  readonly container: Locator;
  readonly appCardSectionHeading: Locator;
  readonly appCardSectionDescription: Locator;
  readonly appCards: Locator;

  constructor(root: Page | Locator) {
    this.container = root.getByLabel('Explore our apps');
    this.appCardSectionHeading = this.container.getByRole('heading', { name: 'What will you create today?' });
    this.appCardSectionDescription = this.container.locator('p').getByText('Our apps make it easy to');
    this.appCards = this.container.getByRole('listitem');
  }

  getAppCard(index: number): AppCard {
    return new AppCard(this.appCards.nth(index));
  }

  async getAppCardsCount(): Promise<number> {
    return await this.appCards.count();
  }
}
