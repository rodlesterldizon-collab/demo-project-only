/* eslint-disable react-hooks/rules-of-hooks */

import { test as base } from '@playwright/test';
import { ErrorPage } from '../../../page-objects/pages/gen-ai/error-page';
import { HomePage } from '../../../page-objects/pages/gen-ai/home.page';

type Fixtures = {
  errorPage: ErrorPage;
  homePage: HomePage;
};

export const test = base.extend<Fixtures>({
  errorPage: async ({ page }, use) => {
    await use(new ErrorPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
