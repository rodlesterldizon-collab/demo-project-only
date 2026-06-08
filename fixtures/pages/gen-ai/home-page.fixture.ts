import { test as base } from '@playwright/test';
import { HomePage } from '@pageObjects/pages/gen-ai/home.page';

type GenAiHomePageDefinitions = {
  homePage: HomePage;
};

export const test = base.extend<GenAiHomePageDefinitions>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
