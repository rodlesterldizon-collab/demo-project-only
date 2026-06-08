import { Locator, Page } from '@playwright/test';

export class ForwardToSelfServeComponent {
  readonly root: Page | Locator;
  readonly button: Locator;
  readonly tooltip: Locator;

  constructor(root: Page | Locator) {
    this.root = root;
    this.button = this.root.getByRole('link', { name: 'Refine in Self-Serve' });
    this.tooltip = this.root.getByRole('tooltip', { name: 'Refine in Self-Serve' });
  }
}
