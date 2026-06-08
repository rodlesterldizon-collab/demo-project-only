import { test } from '@fixtures/pages/gen-ai/error-page.fixture';
import { expect } from '@playwright/test';

test.describe('Error Page Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    // Navigate to the home page before each test
    await homePage.goto();
  });

  test('[GEN-T326, GEN-T328] Should show a generic error page with title, description, and CTA on 40x errors', async ({
    errorPage,
  }) => {
    await errorPage.gotoInvalidPage();
    await errorPage.expectErrorElementsVisible();
  });

  test('[GEN-T327] Should redirect to the homepage when clicking the Go Home button', async ({ errorPage, page }) => {
    await errorPage.gotoInvalidPage();
    await errorPage.clickGoHome();
    await expect(page).toHaveURL('/');
  });
});
