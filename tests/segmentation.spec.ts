import { test } from '../fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';

test.describe(`Segmentation Page Tests`, () => {
  test.beforeEach(async ({ segmentationPage }) => {
    await segmentationPage.goto();
  });

  test('[GEN-T95] Should open feedback form in a new tab when feedback link is clicked', async ({
    page,
    segmentationPage,
  }) => {
    // Given the user is on the Segmentation page
    await expect(segmentationPage.page).toHaveURL(/.*\/segments/);

    // When the user clicks the feedback button
    // Then a new browser tab should open, displaying a feedback form. The original page should remain open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      segmentationPage.feedbackComponent.link.click(),
    ]);

    await expect(newPage).toHaveURL('https://airtable.com/YOUR_AIRTABLE_URL_HERE');
    await expect(page).toHaveURL('/segments');
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    segmentationPage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Inclusive Marketing, etc)
    await expect(page).toHaveURL(/.*\/segments$/);

    // Then I will see a fixed side navigation on the left
    await expect(segmentationPage.sideNavigationComponent.container).toBeVisible();
  });
});
