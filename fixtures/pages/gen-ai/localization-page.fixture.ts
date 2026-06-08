import { test as base } from '@playwright/test';
import { LocalizationPage } from '../../../page-objects/pages/gen-ai/localization.page';

type GenAiLocalizationPageDefinitions = {
  localizationPage: LocalizationPage;
};

export const test = base.extend<GenAiLocalizationPageDefinitions>({
  localizationPage: async ({ page }, use) => {
    await use(new LocalizationPage(page));
  },
});
