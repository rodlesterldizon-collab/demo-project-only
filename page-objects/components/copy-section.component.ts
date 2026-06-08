import { Locator, Page } from '@playwright/test';

export class CopySectionComponent {
  readonly root: Page | Locator;
  readonly button: Locator;
  readonly confirmationIcon: Locator;
  readonly tooltip: Locator;

  constructor(root: Page | Locator) {
    this.root = root;
    this.button = this.root.getByRole('button', { name: 'Copy to clipboard' });
    this.confirmationIcon = this.root.getByRole('button', { name: 'Copied' });
    this.tooltip = this.root.getByRole('tooltip', { name: 'Copy to clipboard' });
  }
}
