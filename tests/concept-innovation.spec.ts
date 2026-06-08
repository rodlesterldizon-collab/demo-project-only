import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { createTestImageFile, waitForGenAi, fillRequiredField, createInvalidFile } from '@components/commons/helpers';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { MessageFeedbackActionsComponent } from '@pageObjects/components/message-feedback-actions.component';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.PRODUCT_CONCEPTS.url}$`);
const GENERATION_URL_REGEX = new RegExp(
  `.*${APPS_DETAILS.PRODUCT_CONCEPTS.url}/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$`
);

test.describe(`Concept Innovation Page Tests`, () => {
  test.beforeEach(async ({ conceptInnovationPage }) => {
    await conceptInnovationPage.goto();
  });

  test('[GEN-T82, GEN-T83, GEN-T84, GEN-85, GEN-T367, GEN-T391, GEN-T329, GEN-T331, GEN-T332] Should validate Idea Statement Field, Brand, Image Style, and Product Packaging selections and should see the loading screen while product concept is being generated', async ({
    conceptInnovationPage,
  }) => {
    // Given the user is on the Concept Innovation form
    await expect(conceptInnovationPage.generateFormSection.ideaStatementField).toBeVisible();

    // When the user enters a string with at least 1 character in the Idea Statement field and submits the form
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);

    // When the user selects a valid Style from the Brand dropdown list and submits the form
    const brandName = (
      await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({
        skipFirst: 1,
        skipLast: 1,
      })
    ).text;

    // When the user selects a valid option from the Image Style dropdown list and submits the form
    await expect(conceptInnovationPage.generateFormSection.imageStyleRadioGroup).toBeVisible();
    const imageStyleName = await conceptInnovationPage.generateFormSection.selectRandomPresetImageStyle();

    // When the user selects a valid option from the Product Packaging dropdown list and submits the form
    const productPackagingName = (
      await conceptInnovationPage.generateFormSection.productPackagingPicker.selectRandomOption()
    ).text;

    // Then the form submission should be successful
    await conceptInnovationPage.generateFormSection.pressGenerateButton();

    // GEN-T367 Should be able to see the loading screen while product concept is being generated
    // Then I will see the loading screen in place of the input and a looping TasteMaker animation
    await conceptInnovationPage.loadScreenComponent.progressBar.waitFor({ state: 'visible' });
    await expect(conceptInnovationPage.loadScreenComponent.loadingScreenAnimation).toBeVisible();
    // And there will be rotating tips that appear (GEN-T329,GEN-T331,GEN-T332)
    await expect(conceptInnovationPage.loadScreenComponent.loadingScreenTip).toBeVisible();

    await waitForGenAi(conceptInnovationPage);
    const prompts = await conceptInnovationPage.promptConsoleSection.collectPrompts();

    // And the generated prompt includes the entered Idea Statement
    expect(prompts.some((prompt) => prompt.includes(ideaStatement))).toBeTruthy();

    // And the generated prompt includes the selected Brand
    expect(
      prompts.some((prompt) =>
        prompt
          .replace(/\W/g, '')
          .toLowerCase()
          .includes((brandName || '').replace(/\W/g, '').toLowerCase())
      )
    ).toBeTruthy();

    // And the generated prompt includes the selected Image Style
    expect(
      // "Concept Sketch" is passed in the prompt as "Sketch"
      prompts.some((prompt) => prompt.includes(imageStyleName === 'Concept Sketch' ? 'Sketch' : imageStyleName))
    ).toBeTruthy();

    // And the generated prompt includes the selected Product Packaging
    expect(prompts.some((prompt) => prompt.includes(productPackagingName!))).toBeTruthy();
  });

  // Skipping test as console drawer currently doesn't expose negative prompt parameters
  test.fixme('[GEN-T38] Should validate Negative Prompt Field', async ({ conceptInnovationPage }) => {
    // Given the user is on the Concept Innovation form
    await expect(conceptInnovationPage.generateFormSection.negativePromptField).toBeVisible();
    // When the user enters a string with at least 1 character in the Negative Prompt field and submits the form
    const negativePrompt = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.negativePromptField.fill(negativePrompt);
    // Then the form submission should be successful
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    // And the generated prompt includes the entered Negative Prompt
    const prompts = await conceptInnovationPage.promptConsoleSection.collectPrompts();
    expect(prompts.some((prompt) => prompt.includes(negativePrompt))).toBeTruthy();
  });

  test('[GEN-T40, GEN-T226, GEN-T229, GEN-T280, GEN-T281, GEN-T282] Should validate output formatting and Supporting Insights and DVF Evaluations', async ({
    conceptInnovationPage,
  }) => {
    // Given the user is on the Concept Innovation page
    await expect(conceptInnovationPage.page).toHaveURL(BASE_URL_REGEX);
    // When the user succesfully submits the form
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    // And generated output content is displayed
    const headingCount = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.count();
    if (headingCount > 0) {
      for (let i = 0; i < headingCount; i++) {
        await expect(conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.nth(i)).toBeVisible();
      }
    } else {
      throw new Error('No output content was found.');
    }
    // Then should see DVF evaluation accordion and can open to see the content
    await expect(conceptInnovationPage.resultAndUpdateFormSection.dvfEvaluationAccordionButton).toBeVisible();
    await conceptInnovationPage.resultAndUpdateFormSection.dvfEvaluationAccordionButton.click();
    await expect(conceptInnovationPage.resultAndUpdateFormSection.dvfEvaluationAccordionButton).toHaveAttribute(
      'data-state',
      'open'
    );
    await expect(conceptInnovationPage.resultAndUpdateFormSection.dvfEvaluationSection).toBeVisible();
    await expect(conceptInnovationPage.resultAndUpdateFormSection.dvfSectionInfo).toBeVisible();
    await expect(conceptInnovationPage.resultAndUpdateFormSection.dvfSectionScore).toBeVisible();

    // Then it should include references to relevant sections of the Insights documents
    await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsAccordionButton.click();
    await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsLoading.waitFor({ state: 'hidden' });
    await expect(conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsSection).toBeVisible();
    const referencesCount = await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsLinks.count();
    expect(referencesCount).toBeGreaterThan(0);
    for (let i = 0; i < referencesCount; i++) {
      const insightLink = await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsLinks
        .nth(i)
        .getAttribute('href');
      expect(insightLink).toMatch(/\/files\/[a-zA-Z0-9-_]+#page=\d+/);
    }
  });

  test('[GEN-T48, GEN-T228] Should verify Update (Feedback) feature works correctly and generates Supporting Insights', async ({
    conceptInnovationPage,
  }) => {
    // Given the user is on the Concept Innovation page
    await expect(conceptInnovationPage.page).toHaveURL(BASE_URL_REGEX);
    // When the user succesfully submits the form
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    expect(await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.count()).toBe(1);
    expect(await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsSection.count()).toBe(1);
    await expect(conceptInnovationPage.resultAndUpdateFormSection.feedback).toBeVisible();

    // And the user has provided valid data for updating
    const feedbackText = 'winter wonderland';
    await conceptInnovationPage.resultAndUpdateFormSection.feedback.fill(feedbackText);
    // When the user presses the "update" button
    await conceptInnovationPage.resultAndUpdateFormSection.pressUpdateButton();
    await waitForGenAi(conceptInnovationPage);

    // adds a new heading / whole new section
    await expect(conceptInnovationPage.resultAndUpdateFormSection.updatedNameHeading).toBeVisible();

    // Then it should show supporting insights for the updated content
    expect(await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsSection.count()).toBe(2);
  });

  test('[GEN-T99, GEN-T100, GEN-T101] Should download images as PNG with the product name as file name', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given a Concept Innovation containing one or more images is displayed to the user
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    // [GEN-T99] Should display visible action buttons on images and display tooltip on mouse hover
    // NOTE: Tooltip tests are currently excluded due to Playwright difficulties
    const imageCount = await conceptInnovationPage.resultAndUpdateFormSection.productImage.count();
    for (let i = 0; i < imageCount; i++) {
      const button = conceptInnovationPage.resultAndUpdateFormSection.productImageDownloadButton.nth(i);
      await expect(button).toBeVisible();
    }

    // When the user clicks the "Download" button on the image
    const downloadPromise = page.waitForEvent('download');
    await conceptInnovationPage.resultAndUpdateFormSection.productImageDownloadButton.first().click();
    const download = await downloadPromise;

    // [GEN-T100] Should download images as PNG file format
    expect(download.suggestedFilename()).toMatch(/\.png$/);

    // [GEN-T101] Should  name downloaded images using the product name
    const productName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.textContent();
    if (productName) {
      // remove special characters and file extension before checking - downloaded file names sometimes modify special characters from the product name
      expect(
        download
          .suggestedFilename()
          .replace(/\.png$/, '')
          .replace(/[^a-zA-Z]/g, '')
      ).toBe(productName.replace(/[^a-zA-Z]/g, ''));
    }
  });

  test('[GEN-T385, GEN-T386, GEN-T248] Should copy the whole product concept text and validate should see up to 4 images by default ', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given user has already generated a product concept
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    //  GEN-T248 - Then I should see between 1 and 4 images generated automatically
    await expect(conceptInnovationPage.resultAndUpdateFormSection.productDetailHeading).toBeVisible();
    const imageCount = await conceptInnovationPage.resultAndUpdateFormSection.productImage.count();
    expect(imageCount).toBeGreaterThanOrEqual(1);
    expect(imageCount).toBeLessThanOrEqual(4);

    const button = conceptInnovationPage.copySectionComponent.button;
    const tooltip = conceptInnovationPage.copySectionComponent.tooltip;
    // GEN-T385
    // When the user hovers the mouse over the copy icon
    await expect(tooltip).toBeHidden();
    await button.hover();
    // Then the button text will appear so that users can understand what the button is for (Copy to clipboard).
    await expect(tooltip).toBeVisible();

    // GEN-T386
    // When the user clicks on the copy text icon
    await button.click();
    // Then the copy icon will be replaced by a check mark for a few seconds
    await expect(conceptInnovationPage.copySectionComponent.confirmationIcon).toBeVisible();
    // Then the text will be copied to the clipboard.
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const sections = ['Product Details', 'Variations', 'Product Benefits'];
    for (const section of sections) {
      const currentSectionLocator = conceptInnovationPage.resultAndUpdateFormSection.generationContainer
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: section }) });
      const sectionText = (await currentSectionLocator.first().innerText()) || '';

      expect(clipboardText).toContain(sectionText.trim());
    }
  });

  test('[GEN-T136, GEN-T369, GEN-T363, GEN-T364] Should verify shareable link button copies page URL to clipboard, and should be able to press the new  New Product Concept button and land back on the form page', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given the user is on the Concept Innovation page
    const ideaStatement = faker.lorem.sentence();
    await fillRequiredField(conceptInnovationPage.generateFormSection.ideaStatementField, ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });

    // When Generate is pressed
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    const copyLinkButton = conceptInnovationPage.copyPageLinkComponent.button;
    await expect(copyLinkButton).toBeVisible();
    await copyLinkButton.click();

    // Link should copied to clipboard
    const expectedText = page.url();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toEqual(expectedText.trim());

    // Button should be in "Copied" state
    const copiedButton = conceptInnovationPage.copyPageLinkComponent.confirmation;
    await expect(copiedButton).toBeVisible();

    //GEN-T363, GEN-T364
    // Given the user has already generated a product concept
    await expect(conceptInnovationPage.resultAndUpdateFormSection.newProductConceptButton).toBeVisible();
    await expect(conceptInnovationPage.page).toHaveURL(GENERATION_URL_REGEX);
    const generatedUrl = conceptInnovationPage.page.url();
    // When they click + New Product Concept
    await conceptInnovationPage.resultAndUpdateFormSection.newProductConceptButton.click();
    // Then the user is redirected to the form page
    await expect(conceptInnovationPage.generateFormSection.pageHeading).toBeVisible({ timeout: 1000 });
    await expect(conceptInnovationPage.generateFormSection.ideaStatementField).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.generateButton).toBeVisible();
    expect(conceptInnovationPage.page.url()).not.toEqual(generatedUrl);
  });

  test('[GEN-T138, GEN-T139, GEN-T168] Should forward a Concept Innovation image to Self-Serve and preserve the Concept Innovation session', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given the user is viewing an AI-generated image in the product brief
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    // When user has generated Image
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);

    for (let i = 0; i < 4; i++) {
      const button = conceptInnovationPage.forwardToSelfServeComponent.button.nth(i);
      const tooltip = conceptInnovationPage.forwardToSelfServeComponent.tooltip;
      await conceptInnovationPage.resultAndUpdateFormSection.updateButton.hover();
      // Then user sees tooltip/helptext
      await expect(tooltip).toBeHidden();
      await button.hover();
      await expect(tooltip).toBeVisible();
      await conceptInnovationPage.resultAndUpdateFormSection.updateButton.hover(); // Move mouse away

      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        // When the user clicks the Forward to Self-Serve button
        conceptInnovationPage.forwardToSelfServeComponent.button.nth(i).click(),
      ]);

      // Then a new browser tab should open
      await newPage.waitForLoadState();
      const regex = new RegExp(
        `${APPS_DETAILS.SELF_SERVE.url}\\?prompt=%5B.*%22name%22%3A%22.*\\.png%22.*%22mimeType%22%3A%22image%2Fpng%22`
      );
      // Then a new browser tab should open, displaying a feedback form. The original page should remain open
      expect(newPage.url()).toMatch(regex);
      // And then self-serve tool should load with the selected product file pre-uploaded
      const productName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading
        .first()
        .textContent();
      await expect(newPage.getByLabel('Prompt Input')).toContainText(productName!);
      // Then the original product brief session should remain active in the current tab
      expect(page.url()).toContain(APPS_DETAILS.PRODUCT_CONCEPTS.url);
    }
  });

  test('[GEN-T145, GEN-T146, GEN-T147, GEN-T148, GEN-T149, GEN-T380, GEN-T381, GEN-T382] Should validate response feedback buttons functionality', async ({
    conceptInnovationPage,
  }) => {
    // Given that the user has already generated a product concept
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.page.waitForURL(/\/[0-9a-f-]+$/);

    // GEN-T380, GEN-T381, GEN-T382
    const textFeedbackActions = new MessageFeedbackActionsComponent(
      conceptInnovationPage.page,
      conceptInnovationPage.resultAndUpdateFormSection.briefContainer
    );
    await textFeedbackActions.checkFeedbackActionsVisibility();
    await textFeedbackActions.checkFeedbackActionsFunctionality();

    // GEN-T145, GEN-T146, GEN-T147, GEN-T148
    const imageSectionsCount = await conceptInnovationPage.resultAndUpdateFormSection.productImage.count();
    for (let i = 0; i < imageSectionsCount; i++) {
      const imageContainer = conceptInnovationPage.resultAndUpdateFormSection.imageContainer.nth(i);
      const imageFeedbackActions = new MessageFeedbackActionsComponent(conceptInnovationPage.page, imageContainer);
      await imageFeedbackActions.checkFeedbackActionsVisibility();
    }
    const imageContainer = conceptInnovationPage.resultAndUpdateFormSection.imageContainer.first();
    const imageFeedbackActions = new MessageFeedbackActionsComponent(conceptInnovationPage.page, imageContainer);
    await imageFeedbackActions.checkFeedbackActionsFunctionality();
  });

  test('[GEN-T91, GEN-T92, GEN-T98] Should display a feedback link, show help text on hover, and open feedback form in a new tab when clicked', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given the user is on the Concept Innovation page
    await expect(conceptInnovationPage.page).toHaveURL(BASE_URL_REGEX);

    // When the user clicks the feedback button
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      conceptInnovationPage.feedbackComponent.link.click(),
    ]);
    await newPage.waitForLoadState();
    // Then a new browser tab should open, displaying a feedback form. The original page should remain open
    expect(newPage.url()).toBe('https://airtable.com/YOUR_AIRTABLE_URL_HERE');
    expect(page.url()).toContain(APPS_DETAILS.PRODUCT_CONCEPTS.url);

    // When the user navigates by scrolling up or down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }); // scroll to the bottom of the page
    // Then the feedback link should be displayed
    await expect(conceptInnovationPage.feedbackComponent.link).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    }); // Scroll back to the top
    await expect(conceptInnovationPage.feedbackComponent.link).toBeVisible();
  });

  test('[GEN-T126] Should update URL when new concepts are generated from Feedback', async ({
    page,
    conceptInnovationPage,
  }) => {
    const getGenerationId = (url: string) => {
      const match = url.match(GENERATION_URL_REGEX);
      return match ? match[1] : null;
    };

    // Given a user is interacting with Concept Innovation
    await expect(conceptInnovationPage.page).toHaveURL(BASE_URL_REGEX);
    const ideaStatement = faker.lorem.sentence();
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    // When the user progresses through the conversation by adding multiple prompts and receiving responses
    // Then the browser URL should be updated to reflect the current state of the conversation
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.resultAndUpdateFormSection.loadingAnimation.waitFor({ state: 'hidden' });
    await conceptInnovationPage.resultAndUpdateFormSection.loadingImagesAnimation.waitFor({ state: 'hidden' });

    await expect(page).toHaveURL(GENERATION_URL_REGEX);
    const firstGenerationId = getGenerationId(page.url());

    const feedbackText = 'add strawberries';
    await conceptInnovationPage.resultAndUpdateFormSection.feedback.pressSequentially(feedbackText);

    await conceptInnovationPage.resultAndUpdateFormSection.pressUpdateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.resultAndUpdateFormSection.loadingAnimation.waitFor({ state: 'hidden' });
    // wait for url to change by awaiting the images load
    await conceptInnovationPage.resultAndUpdateFormSection.loadingImagesAnimation.waitFor({ state: 'hidden' });
    await expect(page).toHaveURL(GENERATION_URL_REGEX);
    const secondGenerationId = getGenerationId(page.url());
    expect(secondGenerationId).not.toEqual(firstGenerationId);
  });

  test('[GEN-T127] Should restore generation from shared URL', async ({ page, conceptInnovationPage }) => {
    // populate form
    const ideaStatement = 'Classic Cheesy Macaroni';
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(ideaStatement);

    const { text: brand } = await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({
      skipFirst: 1,
      skipLast: 1,
    });
    expect(await conceptInnovationPage.generateFormSection.brandPicker.getValues()).toBe(brand);

    // Given a user has a URL representing a previous Concept Innovation thread
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.resultAndUpdateFormSection.loadingAnimation.waitFor({ state: 'hidden' });
    await conceptInnovationPage.resultAndUpdateFormSection.loadingImagesAnimation.waitFor({ state: 'hidden' });
    const copyLinkButton = conceptInnovationPage.copyPageLinkComponent.button;
    await copyLinkButton.click();
    // acquire the generated product name
    const firstProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading
      .first()
      .textContent();
    // update the feedback field
    const feedbackText = 'add strawberries';
    await conceptInnovationPage.resultAndUpdateFormSection.feedback.fill(feedbackText);
    await conceptInnovationPage.resultAndUpdateFormSection.pressUpdateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.resultAndUpdateFormSection.loadingAnimation.waitFor({ state: 'hidden' });
    await conceptInnovationPage.resultAndUpdateFormSection.loadingImagesAnimation.waitFor({ state: 'hidden' });
    await copyLinkButton.click();
    const secondClipboardText = await page.evaluate(() => navigator.clipboard.readText());
    // acquire the generated product name
    const secondProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading
      .nth(1)
      .textContent();

    // return user to initial form page
    await conceptInnovationPage.resultAndUpdateFormSection.newProductConceptButton.click();
    expect(conceptInnovationPage.page.url()).not.toEqual(secondClipboardText);
    await expect(conceptInnovationPage.generateFormSection.pageHeading).toBeVisible({ timeout: 1000 });
    // land on an any page
    await conceptInnovationPage.page.goto('/fakepage');

    // When the user pastes the valid URL into the address bar and navigates to it
    await conceptInnovationPage.page.goto(secondClipboardText);

    // Then the user should be able to view all the previous generation
    const firstRetrievedProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading
      .first()
      .textContent();
    expect(firstRetrievedProductName).toEqual(firstProductName);

    const secondRetrievedProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading
      .nth(1)
      .textContent();
    expect(secondRetrievedProductName).toEqual(secondProductName);
    const retrievedInsightsSectionCount =
      await conceptInnovationPage.resultAndUpdateFormSection.supportingInsightsSection.count();
    expect(retrievedInsightsSectionCount).toEqual(2);
  });

  test('[GEN-T128] Should handle invalid or expired URLs', async ({ conceptInnovationPage, page }) => {
    // Given a user has an invalid or expired URL for a Concept Innovation prompt
    const invalidUrl = `${APPS_DETAILS.PRODUCT_CONCEPTS.url}/12345`;

    // When the user attempts to access the URL
    await page.goto(invalidUrl);

    // THEN the system should produce an error
    await expect(page.getByRole('heading', { name: "Oops! We couldn't find that page" })).toBeVisible();
    // AND the user should be able to navigate back to the main form
    await expect(conceptInnovationPage.sideNavigationComponent.conceptInnovationLink).toBeVisible();
    await expect(conceptInnovationPage.sideNavigationComponent.conceptInnovationLink).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('[GEN-T151]: Should retrieve Concept Innovation generations when navigating back and forth', async ({
    page,
    conceptInnovationPage,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });

    // Given a user started a first generation and started a second generation
    // First generation
    const firstIdeaStatement = 'Classic Cheesy Macaroni';
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(firstIdeaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();

    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.page.waitForURL(/\/[0-9a-f-]+$/);

    const firstProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.textContent();

    // First generation - feedback
    const feedbackText = 'add strawberries';
    await conceptInnovationPage.resultAndUpdateFormSection.feedback.fill(feedbackText);
    await conceptInnovationPage.resultAndUpdateFormSection.pressUpdateButton();
    await waitForGenAi(conceptInnovationPage);
    await expect(conceptInnovationPage.resultAndUpdateFormSection.updatedNameHeading).toBeVisible();

    // Start from scratch
    await conceptInnovationPage.sideNavigationComponent.conceptInnovationLink.click();
    await conceptInnovationPage.page.waitForURL(BASE_URL_REGEX);

    // Second generation
    const secondIdeaStatement = 'Classic Tomato Ketchup';
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially(secondIdeaStatement);
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    await waitForGenAi(conceptInnovationPage);
    await conceptInnovationPage.page.waitForURL(/\/[0-9a-f-]+$/);
    const secondProductName = await conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.textContent();

    // When the user presses back browser button
    await conceptInnovationPage.page.goBack({ waitUntil: 'load' });

    // Then the user should be able to result from the first generation (Chocolate Cheesecake generation with strawberries)
    await expect(conceptInnovationPage.resultAndUpdateFormSection.productNameHeading.first()).toContainText(
      firstProductName!
    );
    await expect(conceptInnovationPage.resultAndUpdateFormSection.feedback.first()).toHaveValue(feedbackText);

    // When the user presses forward
    await conceptInnovationPage.page.goForward({ waitUntil: 'load' });

    // Then user should be able to see second generation (frosted pops)
    await expect(conceptInnovationPage.resultAndUpdateFormSection.productNameHeading).toContainText(secondProductName!);
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    conceptInnovationPage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Inclusive Marketing, etc)
    await expect(page).toHaveURL(BASE_URL_REGEX);

    // Then I will see a fixed side navigation on the left
    await expect(conceptInnovationPage.sideNavigationComponent.container).toBeVisible();
  });

  test('[GEN-T192] Should verify that the selected navigation item is highlighted or indicated with a "selected" state', async ({
    conceptInnovationPage,
  }) => {
    // Given I have logged into the tool and am on the a "specific" page
    // When I view the side navigation
    // Then I see the "specific" item in a 'selected' state to highlight that it is the current page
    await expect(conceptInnovationPage.sideNavigationComponent.conceptInnovationLink).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('[GEN-T124] Should navigate to Concept Innovation page', async ({ page, conceptInnovationPage }) => {
    // Given a user is on the GenAI landing page.
    await conceptInnovationPage.sideNavigationComponent.homeLink.click();

    // When the user clicks the "button" navigation bar
    await conceptInnovationPage.sideNavigationComponent.conceptInnovationLink.click();

    // Then the selected option-page should be displayed.
    await expect(page).toHaveURL(BASE_URL_REGEX);
    await expect(conceptInnovationPage.generateFormSection.pageHeading).toBeVisible();
  });

  test('[GEN-T224] Should be able to clear form fields by pressing Reset button', async ({ conceptInnovationPage }) => {
    // Given a user is on the Concept Innovation page
    // And has filled out the form and asked for a generation
    await conceptInnovationPage.generateFormSection.ideaStatementField.pressSequentially('Classic Mayo');

    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({ skipFirst: 1, skipLast: 1 });

    await expect(conceptInnovationPage.generateFormSection.imageStyleRadioGroup).toBeVisible();
    await conceptInnovationPage.generateFormSection.selectRandomPresetImageStyle();

    await conceptInnovationPage.generateFormSection.productPackagingPicker.selectRandomOption();

    await conceptInnovationPage.generateFormSection.negativePromptField.pressSequentially('Tomato Ketchup');

    // When I click on the "Reset" button
    await conceptInnovationPage.generateFormSection.resetButton.click();

    // Then the form is cleared to the default values and there are no more generations on the page
    await expect(conceptInnovationPage.generateFormSection.ideaStatementField).toHaveValue('');
    expect(await conceptInnovationPage.generateFormSection.brandPicker.getValues()).toBe('');
    await expect(
      conceptInnovationPage.generateFormSection.imageStyleRadioGroup.getByRole('radio', {
        name: 'Concept sketch',
        checked: true,
      })
    ).toBeVisible();

    expect(await conceptInnovationPage.generateFormSection.productPackagingPicker.getValues()).toBe('');

    await expect(conceptInnovationPage.generateFormSection.negativePromptField).toHaveValue('');
  });

  test('[GEN-T250, GEN-T251] Should populate idea statement field when clicking "Generate idea" button', async ({
    conceptInnovationPage,
  }) => {
    test.slow(true, 'Any test that uses Gen AI will be slow!');

    // Given a user is on the Concept Innovation page
    // When navigate to the Idea Statement field
    // Then generate Idea CTA is visible next to the idea statement field
    await expect(conceptInnovationPage.generateFormSection.generateIdeaStatementButton).toBeVisible();

    // When the user clicks the "Generate idea" button
    await conceptInnovationPage.generateFormSection.generateIdeaStatementButton.click();

    // Then the CTA becomes disabled and text changes while preparing the idea
    await expect(conceptInnovationPage.generateFormSection.generateIdeaStatementLoading).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.generateIdeaStatementLoading).toBeDisabled();
    await conceptInnovationPage.generateFormSection.generateIdeaStatementLoading.waitFor({
      state: 'hidden',
      timeout: 60000,
    });

    // And when the idea is generated it's automatically entered in the idea statement field
    await expect(conceptInnovationPage.generateFormSection.generateIdeaStatementButton).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.generateIdeaStatementButton).not.toBeDisabled();
    const ideaStatementText = await conceptInnovationPage.generateFormSection.ideaStatementField.textContent();
    expect(ideaStatementText?.trim().length).toBeGreaterThan(0);
  });

  test('[GEN-T410, GEN-T292, GEN-T293, GEN-T297, GEN-T298] Should see required field and clear idea statement error when field is populated using "Generate idea" button and should display the breadcrumb', async ({
    page,
    conceptInnovationPage,
    homePage,
  }) => {
    test.slow(true, 'Any test that uses Gen AI will be slow!');

    // Given a user is on the Concept Innovation page

    //GEN-T292
    // Then I will see helper text that explains the purpose of the field.
    await expect(conceptInnovationPage.generateFormSection.ideaStatementDescription).toBeVisible();

    // GEN-T293
    // When the user tried to do a generation without an idea statement
    await conceptInnovationPage.generateFormSection.pressGenerateButton();
    // Then the field will be clearly indicated as required.
    await expect(conceptInnovationPage.generateFormSection.ideaStatementError).toBeVisible();

    // GEN-T410
    // When the user clicks the "Generate idea" button and the idea statement field is populated
    await conceptInnovationPage.generateFormSection.generateIdeaStatementButton.click();
    await conceptInnovationPage.generateFormSection.generateIdeaStatementLoading.waitFor({
      state: 'hidden',
      timeout: 60000,
    });
    // Then the input errors are no longer visible
    await expect(conceptInnovationPage.generateFormSection.ideaStatementError).not.toBeVisible();

    // GEN-T297
    // When I view the top of the app at any time.
    // Then I will see a breadcrumb that indicates the site structure (TasteMaker / Create Product Concept).
    await expect(conceptInnovationPage.breadcrumbComponent.parentLink).toBeVisible();
    await expect(conceptInnovationPage.breadcrumbComponent.currentPageLabel).toBeVisible();
    // GEN-T298
    // When I click on the "TasteMaker" title in the breadcrumb.
    // Then I will be directed to the homepage.
    await conceptInnovationPage.breadcrumbComponent.parentLink.click();
    await homePage.bannerTitle.waitFor({ state: 'visible' });
    const currentUrl = new URL(page.url()).pathname;
    expect(currentUrl).not.toContain('/product-concepts');
  });

  test('[GEN-T283,  GEN-T284, GEN-T285,  GEN-T289] Should allow the user to successfully attach a reference image for Packaging', async ({
    conceptInnovationPage,
  }) => {
    // GIVEN the user navigates to the Packaging field
    await expect(conceptInnovationPage.generateFormSection.productPackagingPicker.input).toBeVisible();
    await conceptInnovationPage.generateFormSection.productPackagingPicker.selectRandomOption();
    // WHEN they select the option to upload a reference image for Packaging.
    await expect(conceptInnovationPage.generateFormSection.packagingUploadField).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.packagingUploadTooltipIcon).toBeVisible();
    await conceptInnovationPage.generateFormSection.packagingUploadTooltipIcon.hover();
    await expect(conceptInnovationPage.generateFormSection.packagingUploadTooltip).toBeVisible();
    // THEN they should be able to successfully attach an image from their device.
    const fileChooserPromise = conceptInnovationPage.page.waitForEvent('filechooser');
    await conceptInnovationPage.generateFormSection.packagingUploadMoreButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createTestImageFile()]);
    // THEN a thumbnail preview of the image will appear below the packaging field
    await expect(conceptInnovationPage.generateFormSection.packagingUploadedThumbnail).toBeVisible();
    // WHEN they select the option to upload another reference image for Packaging.
    // THEN the image upload should be prevented because the upload area is hidden
    await expect(conceptInnovationPage.generateFormSection.packagingUploadMoreButton).not.toBeVisible();
    // WHEN the user clicks the "X" on the thumbnail image.
    await conceptInnovationPage.generateFormSection.packagingUploadedThumbnailCloseButton.click();
    // THEN the image is removed (and the thumbnail disappears).
    await expect(conceptInnovationPage.generateFormSection.packagingUploadedThumbnail).not.toBeVisible();
  });

  test('[GEN-T317] Should be able use a custom packaging by typing it out', async ({ conceptInnovationPage }) => {
    // GIVEN the user navigates to the Packaging field
    await expect(conceptInnovationPage.generateFormSection.productPackagingPicker.input).toBeVisible();
    await conceptInnovationPage.generateFormSection.productPackagingPicker.input.click();
    // When they open the drop down. and type one
    // AND When the selection is not available
    await conceptInnovationPage.generateFormSection.productPackagingPicker.input.fill('Custom Glass Bottle');
    // THEN the user can use a Custom packaging not part of the list
    const options = await conceptInnovationPage.generateFormSection.productPackagingPicker.options;
    await options.first().click();
    // AND the custom value should be set in the input
    expect(await conceptInnovationPage.generateFormSection.productPackagingPicker.getValues()).toBe(
      'Custom Glass Bottle'
    );
  });

  // TODO: convert this to integration test
  test('[GEN-T318, GEN-T319] Should be able to see Image styles field and the styles are in the correct order', async ({
    conceptInnovationPage,
  }) => {
    //GEN-T318
    // Given user is on the CI page
    // When the user navigates to  image style field
    await expect(conceptInnovationPage.generateFormSection.imageStyleRadioGroup).toBeVisible();
    const radioButtons = await conceptInnovationPage.generateFormSection.imageStyleRadioButtons.count();
    // Then then the Title, description and styles are visible
    for (let i = 0; i < radioButtons; i++) {
      await expect(conceptInnovationPage.generateFormSection.imageStyleRadioButtons.nth(i)).toBeVisible();
      await expect(conceptInnovationPage.generateFormSection.imageStyleText.nth(i)).toBeVisible();
    }

    // GEN-T319
    // When they click one of the image styles
    // Then it will show the selected state
    const randomIndex = Math.floor(Math.random() * radioButtons);
    await conceptInnovationPage.generateFormSection.imageStyleRadioButtons.nth(randomIndex).click();
    // And I can only select one thumbnail option at a time.
    for (let i = 0; i < radioButtons; i++) {
      const radio = conceptInnovationPage.generateFormSection.imageStyleRadioButtons.nth(i);
      const isChecked = await radio.isChecked();
      if (i === randomIndex) {
        expect(isChecked).toBe(true);
      } else {
        expect(isChecked).toBe(false);
      }
    }
  });

  test('[GEN-T320, GEN-T321] Should be able to create and manage custom image style', async ({
    conceptInnovationPage,
  }) => {
    //GEN-T320
    // Given the user has a specific image style they'd like to create a concept for that is not offered
    await expect(conceptInnovationPage.generateFormSection.customImageStyleButton).toBeVisible();

    // When they click the + Create custom image style button
    await conceptInnovationPage.generateFormSection.customImageStyleButton.click();

    // Then expandable text box will appear where the user can type their custom image style
    await expect(conceptInnovationPage.generateFormSection.customImageStyleInput).toBeVisible();
    await conceptInnovationPage.generateFormSection.customImageStyleInput.fill('Watercolor Style');

    //GEN-T321
    // When they select an image style thumbnail instead
    await conceptInnovationPage.generateFormSection.selectRandomPresetImageStyle();

    // Then the Custom image style field disappear
    await expect(conceptInnovationPage.generateFormSection.customImageStyleInput).not.toBeVisible();

    // And if the user changes back to Custom image style again by using the + Create custom image style button
    await conceptInnovationPage.generateFormSection.customImageStyleButton.click();

    // Then the original text that was captured in the Create custom image style field will re-appear
    await expect(conceptInnovationPage.generateFormSection.customImageStyleInput).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.customImageStyleInput).toHaveValue('Watercolor Style');
  });

  test('[GEN-T308, GEN-T309, GEN-T312] Should be able to create a Custom brand', async ({ conceptInnovationPage }) => {
    // Given the user wants to create a custom brand
    await expect(conceptInnovationPage.generateFormSection.customBrandButton).toBeVisible();
    // GEN-T308 When they click + Create custom brand
    await conceptInnovationPage.generateFormSection.customBrandButton.click();
    expect(await conceptInnovationPage.generateFormSection.brandPicker.getValues()).toBe('Custom Brand');
    // And the user will see a Create custom brand text field
    // And when I hover over the tooltip for Custom Brand I can see help text
    // (note: does not cover checking for the tooltip, because testing for the tooltip causes flaky test)
    await expect(conceptInnovationPage.generateFormSection.customBrandInputTitle).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.customBrandInputHoverIcon).toBeVisible();

    // GEN-T309 When they select a different brand from the drop down
    // Then the Custom brand field will return to the + Create custom brand button
    await conceptInnovationPage.generateFormSection.brandPicker.selectRandomOption({
      skipFirst: 1,
      skipLast: 1,
    });
    await expect(conceptInnovationPage.generateFormSection.customBrandInput).not.toBeVisible();
    // And if the user changes back to Custom brand again by using the + Create custom brand button
    // Then the original text that was captured in the Create custom brand field will re-appear.
    await conceptInnovationPage.generateFormSection.customBrandButton.click();
    // GEN-T312 When I locate the text box
    // Then I can see a draggable text box prefilled with a default text value
    await expect(conceptInnovationPage.generateFormSection.customBrandInput).toContainText('Flavor Twist');
    await conceptInnovationPage.generateFormSection.customBrandInput.fill('Acme Corporation');
    await expect(conceptInnovationPage.generateFormSection.customBrandInput).not.toContainText('Flavor Twist');
  });

  test('[GEN-T324, GEN-T325] Should be displayed Warning messages for required fields', async ({
    conceptInnovationPage,
  }) => {
    // Given I am on the Concept Innovation form
    await expect(conceptInnovationPage.generateFormSection.ideaStatementField).toBeVisible();

    // GEN-T324: Single field validation
    // When I click into a required field (Idea Statement)
    await conceptInnovationPage.generateFormSection.ideaStatementField.click();
    // And then click away from it without entering any text
    await conceptInnovationPage.generateFormSection.form.click();
    // Then an error message should appear
    await expect(conceptInnovationPage.generateFormSection.ideaStatementError).toBeVisible();

    // GEN-T325: Multiple fields validation
    // When I click into another required field (Brand)
    await conceptInnovationPage.generateFormSection.brandPicker.input.click();
    // And then click away without selecting anything
    await conceptInnovationPage.generateFormSection.form.click();
    // Then both error messages should be visible
    await expect(conceptInnovationPage.generateFormSection.ideaStatementError).toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.form.getByText('Brand is required')).toBeVisible();

    // When I fill in one of the required fields
    await conceptInnovationPage.generateFormSection.ideaStatementField.fill('Test concept');
    // Then its error message should disappear while the other remains
    await expect(conceptInnovationPage.generateFormSection.ideaStatementError).not.toBeVisible();
    await expect(conceptInnovationPage.generateFormSection.form.getByText('Brand is required')).toBeVisible();
  });

  test('[GEN-T336, GEN-T339] Should show error message when problems occur when attaching images.', async ({
    conceptInnovationPage,
  }) => {
    // First select a packaging option to enable image upload
    await conceptInnovationPage.generateFormSection.productPackagingPicker.selectRandomOption();
    await expect(conceptInnovationPage.generateFormSection.packagingUploadField).toBeVisible();

    // Given I have an invalid file to attach
    const invalidFile = createInvalidFile();
    const fileChooserPromise = conceptInnovationPage.page.waitForEvent('filechooser');
    await conceptInnovationPage.generateFormSection.packagingUploadMoreButton.click();
    const fileChooser = await fileChooserPromise;

    // When I attach an invalid image
    await fileChooser.setFiles([invalidFile]);
    // Then I should see a toast notification with error message
    const errorToastFile = conceptInnovationPage.generateFormSection.errorToast.getByText('File Format Not Accepted');
    await expect(errorToastFile).toBeVisible();
    // And any file its attached
    await expect(conceptInnovationPage.generateFormSection.packagingUploadedThumbnail).not.toBeVisible();
  });
});
