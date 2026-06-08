import { test } from '../fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { waitForGenAi } from '@components/commons/helpers';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.LOCALIZATION.url}$`);

test.describe(`Localization Page Tests`, () => {
  test.beforeEach(async ({ localizationPage }) => {
    await localizationPage.goto();
  });

  test('[GEN-T1] Should validate Product Details Field - @smoke', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    await expect(localizationPage.generateFormSection.headline).toBeVisible();
    await expect(localizationPage.generateFormSection.productDetail).toBeVisible();
    // When the user enters a string with at least 1 character in the Product Details field and submits the form
    const productDetails = faker.lorem.sentence();
    await localizationPage.generateFormSection.productDetail.fill(productDetails);
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the entered Product Details
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(productDetails);
    }
  });

  test('[GEN-T2] Should generate content for an option in Brand Dropdown', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    // When the user selects a random brand from the Brand dropdown list and submits the form
    const brandOption = await localizationPage.generateFormSection.brandPicker.selectRandomOption();
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the selected Brand
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toMatch(new RegExp(brandOption.text!, 'i'));
    }
  });

  test('[GEN-T3] Should generate content an option in Season Dropdown - @smoke', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    // When the user selects a random Season from the Season dropdown list and submits the form
    const seasonOption = await localizationPage.generateFormSection.seasonPicker.selectRandomOption();
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the selected Season
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(seasonOption.text);
    }
  });

  test('[GEN-T4] Should validate Audience Field functionality - @smoke', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    // When the user selects a predefined audience from the Audience dropdown list and submits the form
    const audienceOption = await localizationPage.generateFormSection.audiencePicker.selectRandomOption();
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the selected Audience
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(audienceOption.text);
    }
  });

  test('[GEN-T5] Should validate selections in Occasions Dropdown', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    // When the user selects a valid Occasion from the Occasions dropdown list and submits the form
    const ocassionsOption = await localizationPage.generateFormSection.occasionPicker.selectRandomOption();
    // Close the dropdown list so the next button can be clicked
    await localizationPage.generateFormSection.occasionPicker.close();
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the selected Occasions
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(ocassionsOption.text);
    }
  });

  test('[GEN-T6] Should validate selections in Locations Dropdown', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    await localizationPage.generateFormSection.locationPicker.clear();
    await localizationPage.generateFormSection.locationPicker.close();
    // // Then an error message should be displayed indicating a location selection is required
    await localizationPage.generateFormSection.pressGenerateButton();
    // TODO: assert there is an error message
    // And when the user selects any location and submits the form
    const locationOption = await localizationPage.generateFormSection.locationPicker.selectRandomOption();
    await localizationPage.generateFormSection.locationPicker.close();
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the selected Location
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(locationOption.text);
    }
  });

  test('[GEN-T7] Should validate Additional Instructions Field', async ({ localizationPage }) => {
    // Given the user is on the Localized Component Copy form
    await expect(localizationPage.generateFormSection.textareaAdditionalInstruction).toBeVisible();
    // When the user enters text into the Additional Instructions field and submits the form
    const additionalInstructions = faker.lorem.paragraph();
    await localizationPage.generateFormSection.productDetail.pressSequentially(additionalInstructions);
    // Then the form submission should be successful
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the generated prompt includes the entered Additional Instructions
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const prompt of prompts) {
      expect(prompt).toContain(additionalInstructions);
    }
  });

  test('[GEN-T8] Should validate results in Form Submission when multiple locations are selected', async ({
    localizationPage,
  }) => {
    // Given the user is on the Localized Component Copy form
    // When the user submits the form with multiple locations

    await localizationPage.generateFormSection.locationPicker.input.click();
    await localizationPage.generateFormSection.locationPicker.clear();
    const location1 = (await localizationPage.generateFormSection.locationPicker.options).nth(0);
    await location1.click();
    const location2 = (await localizationPage.generateFormSection.locationPicker.options).nth(1);
    await location2.click();
    const selectedLocationNames = await Promise.all([location1.textContent(), location2.textContent()]);
    await localizationPage.generateFormSection.locationPicker.close();

    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // Then the generated prompt includes the preselected Locations
    const prompts = await localizationPage.promptConsoleSection.collectPrompts();
    for (const locationName of selectedLocationNames) {
      if (locationName == null) throw Error('location name was null?');
      expect(prompts).toEqual(expect.arrayContaining([expect.stringContaining(locationName)]));
    }
  });

  test('[GEN-T25] Should verify generating and exporting results', async ({ page, localizationPage }) => {
    // Given the user is on the localization page
    await expect(localizationPage.generateFormSection.headline).toBeVisible();
    // When the user succesfully submits the form
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And the user presses the button to export the results
    await localizationPage.resultAndUpdateFormSection.exportButton.waitFor({ state: 'visible' });
    let downloadedFilePath: string | undefined;
    let downloadStarted = false;
    page.on('download', async (download) => {
      downloadedFilePath = download.suggestedFilename();
      downloadStarted = true;
      await download.delete();
    });
    await Promise.all([page.waitForEvent('download'), localizationPage.resultAndUpdateFormSection.pressExportButton()]);
    // Then verify that the download started
    if (downloadStarted && downloadedFilePath) {
      const expectedFileNamePattern = /^\d{4}-\d{2}-\d{2} - Localization\.csv$/;
      expect(downloadedFilePath).toMatch(expectedFileNamePattern);
    } else {
      throw new Error('Download did not start; ensure the export process was triggered correctly.');
    }
  });

  test('[GEN-T26] Should Verify Update Feature Works Correctly', async ({ localizationPage }) => {
    // Given the user is on the localization page
    await expect(localizationPage.generateFormSection.headline).toBeVisible();
    // When the user succesfully submits the form
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    await localizationPage.resultAndUpdateFormSection.updateButton.waitFor({
      state: 'visible',
    });
    await expect(localizationPage.resultAndUpdateFormSection.feedback).toBeVisible();

    // Then the system should process the update request
    // And the user has provided valid data for updating
    const feedbackText = 'winter wonderland';
    await localizationPage.resultAndUpdateFormSection.feedback.fill(feedbackText);
    // When the user presses the "update" button
    await localizationPage.resultAndUpdateFormSection.pressUpdateButton();
    await waitForGenAi(localizationPage);

    await expect(localizationPage.resultAndUpdateFormSection.resultComponentHeading.nth(1)).toBeVisible();
  });

  test('[GEN-T46] Should verify output', async ({ localizationPage }) => {
    // Given the user is on the localization page
    await expect(localizationPage.generateFormSection.headline).toBeVisible();
    // When the user succesfully submits the form
    await localizationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(localizationPage);
    // And generated output content is displayed
    const headingCount = await localizationPage.resultAndUpdateFormSection.locationResultHeading.count();
    if (headingCount > 0) {
      for (let i = 0; i < headingCount; i++) {
        await expect(localizationPage.resultAndUpdateFormSection.locationResultHeading.nth(i)).toBeVisible();
      }
    } else {
      throw new Error('No output content was found.');
    }
  });

  test('[GEN-T94] Should open feedback form in a new tab when feedback link is clicked', async ({
    page,
    localizationPage,
  }) => {
    // Given the user is on the Localization page
    await expect(localizationPage.page).toHaveURL(BASE_URL_REGEX);

    // When the user clicks the feedback button
    // Then a new browser tab should open, displaying a feedback form. The original page should remain open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      localizationPage.feedbackComponent.link.click(),
    ]);

    await expect(newPage).toHaveURL('https://airtable.com/YOUR_AIRTABLE_URL_HERE');
    await expect(page).toHaveURL(BASE_URL_REGEX);
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    localizationPage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Inclusive Marketing, etc)
    await expect(page).toHaveURL(BASE_URL_REGEX);

    // Then I will see a fixed side navigation on the left
    await expect(localizationPage.sideNavigationComponent.container).toBeVisible();
  });
});
