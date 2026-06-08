import { Locator, Page } from '@playwright/test';

export class BreadcrumbPathComponent {
  readonly page: Page;
  readonly breadcrumbNav: Locator;
  readonly parentLink: Locator;
  readonly currentPageLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.breadcrumbNav = this.page.getByRole('navigation').last();
    this.parentLink = this.breadcrumbNav.getByRole('link', { name: 'TasteMaker' });
    this.currentPageLabel = this.breadcrumbNav.getByRole('listitem').nth(1);
  }
}
