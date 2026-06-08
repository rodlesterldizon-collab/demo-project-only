import { test as base } from '@playwright/test';
import { GenerateContentVideoPage } from '@pageObjects/pages/gen-ai/generate-content-video.page';

type GenAiGenerateContentVideoPageDefinitions = {
  generateContentVideoPage: GenerateContentVideoPage;
};

export const test = base.extend<GenAiGenerateContentVideoPageDefinitions>({
  generateContentVideoPage: async ({ page }, use) => {
    // this is not React.use
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new GenerateContentVideoPage(page));
  },
});
