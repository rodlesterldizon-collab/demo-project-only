import { test as base } from '@playwright/test';
import { SelfServePage } from '@pageObjects/pages/gen-ai/self-serve.page';

type GenAiSelfServePageDefinitions = {
  selfservePage: SelfServePage;
};

export const test = base.extend<GenAiSelfServePageDefinitions>({
  selfservePage: async ({ page }, use) => {
    await use(new SelfServePage(page));
  },
});
