import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';
import { random } from 'lodash';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { waitForGenAi, generateMealPrompt } from '@components/commons/helpers';
import { CulturalCompassPage } from '@pageObjects/pages/gen-ai/cultural-compass.page';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.CULTURAL_COMPASS.url}/monitoring$`);

test.describe('Cultural Compass Monitoring Page Tests', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const culturalCompassPage = new CulturalCompassPage(page);

    await culturalCompassPage.goto();
    const prompt = await generateMealPrompt();
    await culturalCompassPage.sendForReviewSection.contentInput.fill(prompt);
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    await culturalCompassPage.sendForReviewSection.bundleContentCheckbox.uncheck();
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);

    await page.close();
  });

  test.beforeEach(async ({ culturalCompassMonitoringPage }) => {
    await culturalCompassMonitoringPage.goto();
  });

  test('[GEN-T254] Should have a separate page for monitoring the reviews for Cultural Compass', async ({
    culturalCompassMonitoringPage,
  }) => {
    // Given user wanted to check past Cultural Compass Generation
    // When user lands on the CC monitoring page
    await expect(culturalCompassMonitoringPage.page).toHaveURL(BASE_URL_REGEX);
    // Then Monitoring Page Title and Description(if applicable) is visible
    await expect(culturalCompassMonitoringPage.logo).toBeVisible();
    await expect(culturalCompassMonitoringPage.title).toBeVisible();
    // And Then list of all reviews section are visible
    await expect(culturalCompassMonitoringPage.reviewList).toBeVisible();
    // And Then section to navigate through the pages
    await expect(culturalCompassMonitoringPage.pageList).toBeVisible();
  });

  test('[GEN-T255, GEN-T256, GEN-T258] Should include a record that has the timestamp visible and all records are in descending order And each record has an input and output', async ({
    culturalCompassMonitoringPage,
  }) => {
    // Given user wanted to check past Cultural Compass Generations
    // When user lands on the CC monitoring page
    await expect(culturalCompassMonitoringPage.reviewList).toBeVisible();
    // Then the historical records are visible
    await expect(culturalCompassMonitoringPage.reviewItem.nth(0)).toBeVisible();

    const totalRecords = await culturalCompassMonitoringPage.reviewItem.count(); // Get total count of records
    const randomIndex = Math.floor(random(1, totalRecords - 1)); // between 1 and total - 1
    const newerReview = culturalCompassMonitoringPage.getReviewRecord(randomIndex - 1); // Get the newer and older review records
    const olderReview = culturalCompassMonitoringPage.getReviewRecord(randomIndex);

    // And Then each record has a timestamp
    await expect(newerReview.root).toBeVisible();
    await expect(newerReview.reviewTimestamp).toBeVisible(); // Assert that the review has a visible timestamp
    const newerTimestampText = await newerReview.reviewTimestamp.textContent(); // Get timestamps and assert descending order
    const olderTimestampText = await olderReview.reviewTimestamp.textContent();
    const newerTimestamp = new Date(newerTimestampText!);
    const olderTimestamp = new Date(olderTimestampText!);
    // And Then the records are ordered on a descending order based on the timestamp
    expect(newerTimestamp.getTime()).toBeGreaterThan(olderTimestamp.getTime());

    // When user ​checks a record
    // Then the ​user sees input section
    await expect(newerReview.reviewRecordInputTitle).toBeVisible();
    const inputItemCount = await newerReview.reviewRecordInputs.count();
    expect(inputItemCount).toBeGreaterThan(0);
    await expect(newerReview.reviewRecordInputs.first()).toBeVisible();
    // And Then user sees output section as accordion (closed)
    await expect(newerReview.reviewOutputTitle).toBeVisible();
    await newerReview.reviewOutputTitle.click();

    // When user clicks on the accordion
    // Then it unfurls and displays review content and references
    await expect(newerReview.reviewOutputTitle).toHaveAttribute('data-state', 'open');
    await expect(newerReview.reviewOutputContent).toBeVisible();
    await expect(newerReview.reviewOutputReferences).toBeVisible();
  });
});
