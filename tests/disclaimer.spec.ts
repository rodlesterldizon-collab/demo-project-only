import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';

test.describe('Disclaimer Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('[GEN-T240, GEN-T244] Should open legal disclaimer page correctly', async ({ disclaimerPage }) => {
    await expect(disclaimerPage.page).toHaveURL(/\/terms-of-use$/);

    await expect(disclaimerPage.tasteMakerImg).toBeVisible();

    await expect(disclaimerPage.disclaimerText).toBeVisible();
    const paragraphsCount = await disclaimerPage.disclaimerParagraphs.count();
    expect(paragraphsCount).toBeGreaterThan(1);
  });
});
