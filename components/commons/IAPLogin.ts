import { Page } from 'playwright-core';

const credentials = {
  username: process.env.IAP_USERNAME || '',
  password: process.env.IAP_PASSWORD || '',
};

export class AuthPage {
  page: Page;
  baseUrl: string;

  constructor(page: Page, baseUrl = '') {
    this.page = page;

    // forcing it to login into US as we don't know what locale the machine running this test would be in.
    // this should save state for all locales anyways
    this.baseUrl = baseUrl;
  }

  async submitLoginForm() {
    await this.page.locator('input[type="email"]').waitFor({ state: 'visible' });
    await this.page.click('input[type="email"]');
    await this.page.fill('input[type="email"]', `${credentials.username}`);
    await this.page.click('[type="submit"]');
    await this.page.click('input[type="password"]');
    await this.page.fill('input[type="password"]', `${credentials.password}`);
    await this.page.click('text="Sign In"');
    await this.page.waitForTimeout(5000);
  }

  async login() {
    await Promise.all([this.page.goto(this.baseUrl), this.page.waitForNavigation()]);
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await this.page.reload();
        }
        await this.submitLoginForm();
        break;
      } catch (error) {
        if (attempt < maxRetries - 1) {
          await this.page.waitForTimeout(5000);
        }
      }
    }
  }
}
