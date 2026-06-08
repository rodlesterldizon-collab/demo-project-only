import { test } from '../fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { waitForGenAi } from '@components/commons/helpers';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.CRM.url}$`);

test.describe(`Push Notifications Page Tests`, () => {
  test.beforeEach(async ({ pushNotificationsPage }) => {
    await pushNotificationsPage.goto();
  });

  test('[GEN-T96] Should open feedback form in a new tab when feedback link is clicked', async ({
    page,
    pushNotificationsPage,
  }) => {
    // Given the user is on the Push Notifications page
    await expect(pushNotificationsPage.page).toHaveURL(BASE_URL_REGEX);

    // When the user clicks the feedback button
    // Then a new browser tab should open, displaying a feedback form. The original page should remain open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      pushNotificationsPage.feedbackComponent.link.click(),
    ]);

    await expect(newPage).toHaveURL('https://airtable.com/YOUR_AIRTABLE_URL_HERE');
    await expect(page).toHaveURL(BASE_URL_REGEX);
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    pushNotificationsPage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Inclusive Marketing, etc)
    await expect(page).toHaveURL(BASE_URL_REGEX);

    // Then I will see a fixed side navigation on the left
    await expect(pushNotificationsPage.sideNavigationComponent.container).toBeVisible();
  });

  test('[GEN-T11] Should be able to choose a Generation Type', async ({ pushNotificationsPage }) => {
    // Given the user has selected a specific generation type

    await expect(pushNotificationsPage.generateFormSection.perSegmentRadioButton).toBeVisible();
    await expect(pushNotificationsPage.generateFormSection.perSegmentRadioButton).toBeChecked();
    // When the user selects a type
    await pushNotificationsPage.generateFormSection.perDemographicRadioButton.click();
    // Then the field should show the selection
    await expect(pushNotificationsPage.generateFormSection.perDemographicRadioButton).toBeVisible();
    await expect(pushNotificationsPage.generateFormSection.perDemographicRadioButton).toBeChecked();
  });

  test('[GEN-T12] Should be able to choose a Brand', async ({ pushNotificationsPage }) => {
    // Given the user has selected a specific brand
    // When brand is selected
    const { text: brand } = await pushNotificationsPage.generateFormSection.brandPicker.selectRandomOption();

    // Then selected brand should populate the field
    expect(await pushNotificationsPage.generateFormSection.brandPicker.getValues()).toBe(brand);
  });

  test('[GEN-T13] Should be able to choose a Season', async ({ pushNotificationsPage }) => {
    // Given the user is logged into the Marketing AI application
    const { text: season } = await pushNotificationsPage.generateFormSection.seasonPicker.selectRandomOption();
    // Then the selected season should be displayed
    expect(await pushNotificationsPage.generateFormSection.seasonPicker.getValues()).toBe(season);
    // And then user can clear the field
    await pushNotificationsPage.generateFormSection.seasonPicker.clear();
    expect(await pushNotificationsPage.generateFormSection.seasonPicker.getValues()).toBe('');
  });

  test('[GEN-T14] Should be able to select Audience', async ({ pushNotificationsPage }) => {
    // Given the user is logged into the Marketing AI application
    // When the user selects an audience from the dropdown
    const { text: audience } = await pushNotificationsPage.generateFormSection.audiencePicker.selectRandomOption();
    // Then the selected audience should be displayed
    expect(await pushNotificationsPage.generateFormSection.audiencePicker.getValues()).toBe(audience);
    // And then user can clear the field
    await pushNotificationsPage.generateFormSection.audiencePicker.clear();
    expect(await pushNotificationsPage.generateFormSection.audiencePicker.getValues()).toBe('');
  });

  test('[GEN-T15] Should be able to see Demographic is a required field and choose Demographic options', async ({
    pushNotificationsPage,
  }) => {
    // Given the user has applied demographic filters to an audience segment
    await pushNotificationsPage.generateFormSection.perDemographicRadioButton.click();
    // When the user press generate
    await pushNotificationsPage.generateFormSection.generateButton.click();
    // Then the generation results should not run
    await expect(pushNotificationsPage.outputResultSection.loadingAnimation).not.toBeVisible();
    // When user adds options
    await pushNotificationsPage.generateFormSection.demographicPicker.open();
    const optionCount = await (await pushNotificationsPage.generateFormSection.demographicPicker.options).count();
    for (let i = 0; i < optionCount; i++) {
      const option = (await pushNotificationsPage.generateFormSection.demographicPicker.options).nth(i);
      await option.click();
    }
    await pushNotificationsPage.generateFormSection.demographicPicker.close();
    // Then all or none options can be selected
    const selectionCount = (await pushNotificationsPage.generateFormSection.demographicPicker.getValues()).length;
    expect(selectionCount).toBe(optionCount);
    await pushNotificationsPage.generateFormSection.demographicPicker.clear();
    expect(await pushNotificationsPage.generateFormSection.audiencePicker.getValues()).toBe('');
  });

  test('[GEN-T16] Should be verify segments is a required field and add or remove segment options', async ({
    pushNotificationsPage,
  }) => {
    // Given the user selects segment from the radio options)
    await pushNotificationsPage.generateFormSection.perDemographicRadioButton.click();
    await expect(pushNotificationsPage.generateFormSection.perSegmentRadioButton).not.toBeChecked();
    await pushNotificationsPage.generateFormSection.perSegmentRadioButton.click();
    await expect(pushNotificationsPage.generateFormSection.perSegmentRadioButton).toBeChecked();
    // When the user navigates to the "Segmentation" section
    await expect(pushNotificationsPage.generateFormSection.segmentsPicker.input).toBeVisible();
    // Then the user and deletes options selected
    const selectionCount = (await pushNotificationsPage.generateFormSection.segmentsPicker.getValues()).length;
    expect(await pushNotificationsPage.generateFormSection.segmentsPicker.getValues()).not.toBe('');
    await pushNotificationsPage.generateFormSection.segmentsPicker.clear();
    // Then the field will not have any values
    expect(await pushNotificationsPage.generateFormSection.segmentsPicker.getValues()).toBe('');

    // When The user deletes the entries and click on the generate button
    await pushNotificationsPage.generateFormSection.generateButton.click();
    // Then the field validation is displayed on segments and no result is generated
    await expect(
      pushNotificationsPage.outputResultSection.root.getByText('Must include segment value for this Generation Type')
    ).toBeVisible();
    await expect(pushNotificationsPage.outputResultSection.loadingAnimation).not.toBeVisible();

    // When user selects any value randomly then the field is populated with field values(use same number previously removed)
    await pushNotificationsPage.generateFormSection.segmentsPicker.open();
    for (let i = 0; i < selectionCount; i++) {
      const option = (await pushNotificationsPage.generateFormSection.segmentsPicker.options).nth(i);
      await option.click();
    }
    await pushNotificationsPage.generateFormSection.segmentsPicker.close();
    // Then all or none options can be selected
    const newSelectionCount = (await pushNotificationsPage.generateFormSection.segmentsPicker.getValues()).length;
    expect(newSelectionCount).toBe(selectionCount);
  });

  test('[GEN-T17, GEN-T18, GEN-T19] Should be able to enable the recipe toggle and toggle emojis button', async ({
    pushNotificationsPage,
  }) => {
    // Given the user is on the Push Notification page
    // When the user clicks on Recipe toggle
    await pushNotificationsPage.generateFormSection.includeRecipeToggle.click();
    // Then the recipe toggle can be enabled
    await pushNotificationsPage.generateFormSection.includeRecipeToggle.isEnabled();

    // When the user clicks on emoji toggle
    await pushNotificationsPage.generateFormSection.emojiToggle.click();
    // Then the emoji toggle can be disabled then enabled
    await pushNotificationsPage.generateFormSection.emojiToggle.isDisabled();
    await pushNotificationsPage.generateFormSection.emojiToggle.click();
    await pushNotificationsPage.generateFormSection.emojiToggle.isEnabled();

    // When the user clicks on headline toggle
    await pushNotificationsPage.generateFormSection.includeHeadlineToggle.click();
    // Then the headline toggle can be enabled
    await pushNotificationsPage.generateFormSection.includeHeadlineToggle.isEnabled();

    // When the user navigates to the grounding query field
    await expect(pushNotificationsPage.generateFormSection.groundingQueryTextBox).toBeVisible();
    // Then user can type in the field
    const sentence = faker.lorem.sentence();
    await pushNotificationsPage.generateFormSection.groundingQueryTextBox.fill(sentence);
    const filledValue = await pushNotificationsPage.generateFormSection.groundingQueryTextBox.inputValue();
    expect(filledValue).toMatch(sentence);

    // When the user navigates to the Push Notification Purpose field
    await pushNotificationsPage.generateFormSection.purposeTextArea.click();
    await expect(pushNotificationsPage.generateFormSection.purposeTextArea).toBeVisible();
    const fillText = 'Remember to save your recipe';
    const prefilledValue = await pushNotificationsPage.generateFormSection.purposeTextArea.inputValue();
    // Then user can see it prefilled
    expect(prefilledValue).toMatch(fillText);
    // And clearing the field value will show it as a required field
    await pushNotificationsPage.generateFormSection.purposeTextArea.clear();
    await pushNotificationsPage.generateFormSection.generateButton.click();
    await expect(pushNotificationsPage.generateFormSection.purposeTextAreaWarning).toBeVisible();
  });
  test('[GEN-T21, GEN-T22] Should be able to use the placeholder dropdown and provide additional instructions', async ({
    pushNotificationsPage,
  }) => {
    // Given user navigates to placeholder field
    await expect(pushNotificationsPage.generateFormSection.placeholdersPicker.input).toBeVisible();
    // When dropdown is clicked
    await pushNotificationsPage.generateFormSection.placeholdersPicker.open();
    // Then the user can add any number of place holder options
    const optionCount = await (await pushNotificationsPage.generateFormSection.placeholdersPicker.options).count();
    for (let i = 0; i < optionCount; i++) {
      const option = (await pushNotificationsPage.generateFormSection.placeholdersPicker.options).nth(i);
      await option.click();
    }
    await pushNotificationsPage.generateFormSection.placeholdersPicker.close();
    const selectionCount = (await pushNotificationsPage.generateFormSection.placeholdersPicker.getValues()).length;
    expect(selectionCount).toBe(optionCount);

    // When user navigates to the additional instructions
    await expect(pushNotificationsPage.generateFormSection.additionalInstructionsTextArea).toBeVisible();
    // Then the user can provide additional instructions
    const sentence = faker.lorem.sentence();
    await pushNotificationsPage.generateFormSection.additionalInstructionsTextArea.fill(sentence);
    const filledValue = await pushNotificationsPage.generateFormSection.additionalInstructionsTextArea.inputValue();
    expect(filledValue).toMatch(sentence);
  });

  test('[GEN-T20, GEN-T23, GEN-T24] Should be able to generate output, export and update with feedback', async ({
    pushNotificationsPage,
  }) => {
    // Given the user provides specific input data
    await pushNotificationsPage.generateFormSection.includeHeadlineToggle.click();
    // When the generate button is pressed
    await pushNotificationsPage.generateFormSection.generateButton.click();
    await waitForGenAi(pushNotificationsPage);
    // Then the output is generated
    const selectionCount = (await pushNotificationsPage.generateFormSection.segmentsPicker.getValues()).length;
    for (let i = 0; i < selectionCount; i++) {
      await expect(pushNotificationsPage.outputResultSection.resultHeadline.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.resultComponentBreakdown.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.headlineComponentBreakdown.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.headlineContentComponentBreakdown.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.bodyComponentBreakdown.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.bodyContentComponentBreakdown.nth(i)).toBeVisible();
      await expect(pushNotificationsPage.outputResultSection.resultReasoningBreakdown.nth(i)).toBeVisible();
    }
    // When a export button is visible
    await expect(pushNotificationsPage.outputResultSection.exportButton).toBeVisible();
    // Then click on the export will download an export file
    const [download] = await Promise.all([
      pushNotificationsPage.page.waitForEvent('download'),
      pushNotificationsPage.outputResultSection.exportButton.click(),
    ]);
    const suggestedFileName = download.suggestedFilename();
    expect(suggestedFileName).toMatch(/\d{4}-\d{2}-\d{2} - Push Notifications\.csv$/);

    // When the user add text and presses the "update" button
    const sentence = faker.lorem.sentence();
    await pushNotificationsPage.outputResultSection.feedback.fill(sentence);
    // Then the system should process the update request
    await expect(pushNotificationsPage.outputResultSection.updateButton).toBeVisible();
    await pushNotificationsPage.outputResultSection.updateButton.click();
    await waitForGenAi(pushNotificationsPage);
    expect(await pushNotificationsPage.outputResultSection.exportButton.count()).toBe(2);
    expect(await pushNotificationsPage.outputResultSection.result.count()).toBe(selectionCount * 2);
  });
});
