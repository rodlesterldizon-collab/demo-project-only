import { Locator, Page } from '@playwright/test';

export class CopyShareableLinkComponent {
  readonly root: Page | Locator;
  readonly button: Locator;
  readonly confirmation: Locator;

  constructor(root: Page | Locator, label = 'Copy shareable link') {
    this.root = root;
    this.button = this.root.getByRole('button', { name: label });
    this.confirmation = this.root.getByRole('button', { name: 'Link copied' });
  }
}
