import { test as base } from '@playwright/test';
import { GenerateContentImagePage } from '@pageObjects/pages/gen-ai/generate-content-image.page';

type GenAiGenerateContentImagePageDefinitions = {
  generateContentImagePage: GenerateContentImagePage;
};

export const test = base.extend<GenAiGenerateContentImagePageDefinitions>({
  generateContentImagePage: async ({ page }, use) => {
    // this is not React.use
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new GenerateContentImagePage(page));
  },
});
