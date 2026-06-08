import { test as base } from '@playwright/test';
import { ConceptInnovationPage } from '@pageObjects/pages/gen-ai/concept-innovation.page';

type GenAiConceptInnovationPageDefinitions = {
  conceptInnovationPage: ConceptInnovationPage;
};

export const test = base.extend<GenAiConceptInnovationPageDefinitions>({
  conceptInnovationPage: async ({ page }, use) => {
    await use(new ConceptInnovationPage(page));
  },
});
