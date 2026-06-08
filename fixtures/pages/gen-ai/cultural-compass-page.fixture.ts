import { test as base } from '@playwright/test';
import { CulturalCompassPage } from '@pageObjects/pages/gen-ai/cultural-compass.page';

type GenAiCulturalCompassPageDefinitions = {
  culturalCompassPage: CulturalCompassPage;
};

export const test = base.extend<GenAiCulturalCompassPageDefinitions>({
  culturalCompassPage: async ({ page }, use) => {
    // this is not React.use
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new CulturalCompassPage(page));
  },
});
