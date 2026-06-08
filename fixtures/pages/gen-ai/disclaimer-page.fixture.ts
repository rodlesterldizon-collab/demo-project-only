/* eslint-disable react-hooks/rules-of-hooks */
import { test as baseTest } from '@playwright/test';
import { genAiBasePage } from '@pageObjects/pages/gen-ai/base.page';
import { DisclaimerPage } from '@pageObjects/pages/gen-ai/disclaimer.page';

type Fixtures = {
  disclaimerPage: DisclaimerPage;
  basePage: genAiBasePage;
};

export const test = baseTest.extend<Fixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new genAiBasePage(page);
    await use(basePage);
  },

  disclaimerPage: async ({ basePage, context }, use) => {
    await basePage.sideNavigationComponent.tourOnboardingButton.click();

    const numOfPages = await basePage.onboardingModalComponent.numOfPages;
    for (let i = 0; i < numOfPages - 1; i++) {
      await basePage.onboardingModalComponent.nextButton.click();
    }

    const [newPage] = await Promise.all([context.waitForEvent('page'), basePage.onboardingModallearnMoreLink.click()]);
    await newPage.waitForLoadState('domcontentloaded');

    const disclaimerPage = new DisclaimerPage(newPage);
    await disclaimerPage.waitForLoad();
    await use(disclaimerPage);
  },
});
