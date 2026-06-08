import { Locator } from '@playwright/test';

export class AppCard {
  readonly root: Locator;
  readonly link: Locator;
  readonly image: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly button: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.link = root.getByRole('link');
    this.image = root.locator('img');
    this.title = root.locator('p.font-bold');
    this.description = root.locator('p:not(.font-bold)');
    this.button = root.getByText('Try the app');
  }
}
