import { createTestImageFile, waitForGenAi, createInvalidFile } from '@components/commons/helpers';
import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from 'playwright/test';
import { createFakeJwt } from '@/users/createFakeJwt';
import { OnboardingModalComponent } from '@pageObjects/components/onboarding-modal.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { CopySectionComponent } from '@pageObjects/components/copy-section.component';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.CULTURAL_COMPASS.url}$`);
const GENERATION_URL_REGEX = new RegExp(
  `.*${APPS_DETAILS.CULTURAL_COMPASS.url}/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$`
);

test.describe('Cultural Compass Page Tests', () => {
  test.beforeEach(async ({ culturalCompassPage }) => {
    await culturalCompassPage.goto();
  });

  test('[GEN-T155, GEN-T156, GEN-T157, GEN-T269] Should copy text from a single review and can preview the text inside the modal', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given the user is on the Cultural Compass page
    // When the user adds content and clicks the "Send for review" button

    // add first content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      "Gather 'round the table with everyone! Classic Cheesy Macaroni: a classic comfort food that brings families of all shapes and sizes together."
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    // add second content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    // not bundling content to generate separated review sections
    await culturalCompassPage.sendForReviewSection.bundleContentCheckbox.uncheck();
    // send for review
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);

    // [GEN-T155] - Then the application should display sections with "Copy" buttons
    const sectionsCount = 2;
    for (let i = 0; i < sectionsCount; i++) {
      await culturalCompassPage.resultsSection.generatingLoad.nth(i).waitFor({
        state: 'hidden',
      });
      await expect(culturalCompassPage.resultsSection.copyReviewComponent.button.nth(i)).toBeVisible();
    }

    // [GEN-T156]
    const copyButton = culturalCompassPage.resultsSection.copyReviewComponent.button.first();
    const copyConfirmation = culturalCompassPage.resultsSection.copyReviewComponent.confirmationIcon.first();
    // When the user clicks the "Copy" button in the section
    // Then the copy icon should change to indicate that the content was copied
    await copyButton.click();
    await expect(copyConfirmation).toBeVisible();

    // [GEN-T157] - Then the clipboard should contain the text from that section
    const expectedText = (await culturalCompassPage.resultsSection.reviewContent.first().innerText()) || '';
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toEqual(expectedText.trim());

    // When the user clicks on the text content in the results section
    await expect(culturalCompassPage.resultsSection.textAttachment.first()).toBeVisible();
    await culturalCompassPage.resultsSection.textAttachment.first().click();
    // Then it should open a modal to display the text content
    await expect(culturalCompassPage.modal).toBeVisible();
  });

  test('[GEN-T152] Should open modal with expanded image when user clicks on uploaded image', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page and the user has uploaded an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await culturalCompassPage.sendForReviewSection.uploadFilesButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createTestImageFile()]);

    // When the user clicks on the image
    await expect(culturalCompassPage.modal).toBeHidden();
    await culturalCompassPage.sendForReviewSection.uploadedImage.click();

    // Then it should open a modal with the expanded image
    await expect(culturalCompassPage.modal).toBeVisible();
  });

  test('[GEN-T270] Should open the text modal with when user clicks on text content icon in the Review section', async ({
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page and the user has added text for review
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();

    // When the user clicks on the text
    await expect(culturalCompassPage.modal).toBeHidden();
    await culturalCompassPage.sendForReviewSection.uploadedText.click();

    // Then it should open a modal with the expanded text
    await expect(culturalCompassPage.modal).toBeVisible();
  });

  test('[GEN-T153] Should open modal with expanded image when user clicks on image in a review section', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page and the user has uploaded an image and sent it for review
    const fileChooserPromise = page.waitForEvent('filechooser');
    await culturalCompassPage.sendForReviewSection.uploadFilesButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createTestImageFile()]);
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);

    // When the user clicks on the image in the review section
    await expect(culturalCompassPage.modal).toBeHidden();
    await culturalCompassPage.resultsSection.imageContent.click();

    // Then it should open a modal with the expanded image
    await expect(culturalCompassPage.modal).toBeVisible();
  });

  test('[GEN-T154] Should close image modal when close button in clicked', async ({ page, culturalCompassPage }) => {
    // Given the user is in the Cultural Compass page and the user has uploaded an image and opened the image modal
    const fileChooserPromise = page.waitForEvent('filechooser');
    await culturalCompassPage.sendForReviewSection.uploadFilesButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createTestImageFile()]);
    await culturalCompassPage.sendForReviewSection.uploadedImage.click();

    // When the user clicks on the modal close button
    await culturalCompassPage.modal.getByRole('button', { name: 'Close' }).click();

    // Then the modal should no longer be visible
    await expect(culturalCompassPage.modal).toBeHidden();
  });

  test('[GEN-T160] Should be able to select multiple Evaluation Focus options', async ({ culturalCompassPage }) => {
    // Given the user is in the Cultural Compass page
    // When the user selects multiple Evalution focus options
    const numOfItems = 3;
    const selectedOptions = [];
    for (let i = 0; i < numOfItems; i++) {
      await culturalCompassPage.sendForReviewSection.evaluationFocusPicker.click();
      const selectedOption = culturalCompassPage.sendForReviewSection.evaluationFocusListboxOption.nth(i);
      selectedOptions.push((await selectedOption.textContent()) ?? '');
      await selectedOption.click();
      await culturalCompassPage.page.keyboard.press('Escape');
    }

    // Then the Evalution focus field should display all the selected options
    for (let i = 0; i < numOfItems; i++) {
      await expect(culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption.nth(i)).toHaveText(
        selectedOptions[i]
      );
    }
  });

  test('[GEN-T162] Should enable custom text to be entered in the Evaluation Focus field', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page
    // When the user types something in the Evalution focus field and creates a new option
    const customOption = 'Stereotypes';
    await culturalCompassPage.sendForReviewSection.evaluationFocusInput.fill(customOption);
    await page.keyboard.press('Enter');

    // Then the Evalution focus field should display the new custom option
    await expect(culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption).toHaveText(customOption);
  });

  test('[GEN-T163] Should allow selected Evaluation Focus options to be removed', async ({ culturalCompassPage }) => {
    // Given the user is in the Cultural Compass page and the user has selected some Evaluation Focus options
    const numOfItems = 3;
    const selectedOptions = [];
    for (let i = 0; i < numOfItems; i++) {
      await culturalCompassPage.sendForReviewSection.evaluationFocusPicker.click();
      const selectedOption = culturalCompassPage.sendForReviewSection.evaluationFocusListboxOption.nth(i);
      selectedOptions.push((await selectedOption.textContent()) ?? '');
      await selectedOption.click();
      await culturalCompassPage.page.keyboard.press('Escape');
    }

    // When the user clicks the remove button on a selected option
    const randomIndex = Math.floor(Math.random() * numOfItems);
    const optionToRemove = selectedOptions[randomIndex];
    await culturalCompassPage.sendForReviewSection.evaluationFocusRemoveButton.nth(randomIndex).click();

    // Then the selected option should be removed from the Evaluation Focus field
    await expect(culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption).toHaveCount(numOfItems - 1);
    const remainingOptions =
      await culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption.allTextContents();
    expect(remainingOptions).not.toContain(optionToRemove);
  });

  test('[GEN-T164] Should enable content to be sent for review without any Evaluation Focus', async ({
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page and has uploaded some content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      "Gather 'round the table with everyone! Classic Cheesy Macaroni: a classic comfort food that brings families of all shapes and sizes together."
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();

    // When the Evalution focus field is empty
    await expect(culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption).toBeHidden();

    // Then user should be able to send content for review
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await expect(culturalCompassPage.resultsSection.generatingLoad).toBeVisible();
  });

  test('[GEN-T167, GEN-T165] Should display the selected Evaluation focus on the results content', async ({
    culturalCompassPage,
  }) => {
    // Given the user is in the Cultural Compass page and has uploaded some content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      "Gather 'round the table with everyone! Classic Cheesy Macaroni: a classic comfort food that brings families of all shapes and sizes together."
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();

    // When the user selects a Evalution focus and clicks the "Send for review" button
    const numOfItems = 3;
    const selectedOptions = [];
    for (let i = 0; i < numOfItems; i++) {
      await culturalCompassPage.sendForReviewSection.evaluationFocusPicker.click();
      const selectedOption = culturalCompassPage.sendForReviewSection.evaluationFocusListboxOption.nth(i);
      selectedOptions.push((await selectedOption.textContent()) ?? '');
      await selectedOption.click();
      await culturalCompassPage.page.keyboard.press('Escape');
    }
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);

    // [GEN-T165] - Then the Evalution focus field should not have any selected options
    await expect(culturalCompassPage.sendForReviewSection.evaluationFocusSelectedOption).toBeHidden();

    // [GEN-T167] - Then the review section identifies the selected Evalution focus
    const evaluationFocus = (await culturalCompassPage.resultsSection.evaluationFocus.innerText()) || '';
    for (const selectedOption of selectedOptions) {
      expect(evaluationFocus).toContain(selectedOption);
    }
  });

  test('[GEN-T174, GEN-T175, GEN-T177] Should trigger a new review upon resubmission', async ({
    culturalCompassPage,
  }) => {
    // Given a user has submitted content for a Cultural Compass review
    // add first content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      "Gather 'round the table with everyone! Classic Cheesy Macaroni: a classic comfort food that brings families of all shapes and sizes together."
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    // add second content
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    // not bundling content to generate separated review sections
    await culturalCompassPage.sendForReviewSection.bundleContentCheckbox.uncheck();
    // send for review
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);

    // GEN-T174
    const sectionsCount = 2;
    for (let i = 0; i < sectionsCount; i++) {
      // When the user receives the initial review
      await culturalCompassPage.resultsSection.generatingLoad.nth(i).waitFor({
        state: 'hidden',
      });

      // Then a clearly visible option to resubmit the review should be available to the user
      await expect(culturalCompassPage.resultsSection.regenerateButton.nth(i)).toBeVisible();
    }

    // GEN-T175
    // When the user clicks the "Regenerate review" option
    const firstReview = (await culturalCompassPage.resultsSection.reviewContent.first().innerText()) || '';
    const regenerateButton = culturalCompassPage.resultsSection.regenerateButton.first();
    await regenerateButton.click();
    // Then a new review process should be triggered for the same original content
    await expect(culturalCompassPage.resultsSection.generatingLoad).toBeVisible();

    // GEN-T177
    await waitForGenAi(culturalCompassPage);
    const secondReview = (await culturalCompassPage.resultsSection.reviewContent.first().innerText()) || '';
    // When the user views their review history
    expect(firstReview).not.toEqual(secondReview);
    await expect(culturalCompassPage.resultsSection.reviewContainer.getByText('2 / 2')).toBeVisible();
    // Then all previous reviews, including the initial review and all subsequent resubmissions, should be stored and accessible to the user
    await expect(culturalCompassPage.resultsSection.reviewNextResponse).toBeDisabled();
    await culturalCompassPage.resultsSection.reviewPreviousResponse.click();
    await expect(culturalCompassPage.resultsSection.reviewContainer.getByText('1 / 2')).toBeVisible();

    await expect(culturalCompassPage.resultsSection.reviewPreviousResponse).toBeDisabled();
    await culturalCompassPage.resultsSection.reviewNextResponse.click();
    await expect(culturalCompassPage.resultsSection.reviewContainer.getByText('2 / 2')).toBeVisible();
  });

  test('[GEN-T169, GEN-T172] Should Include Toolkit References in Review', async ({ culturalCompassPage }) => {
    // Given a review is generated for the provided marketing material
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);
    await culturalCompassPage.resultsSection.generatingLoad.waitFor({
      state: 'hidden',
    });

    // When the review is displayed
    await expect(culturalCompassPage.resultsSection.reviewContent).toBeVisible();

    // Then the review should include references (e.g., page numbers, section titles, or direct links) to relevant sections of the Inclusive Marketing Toolkit
    await culturalCompassPage.resultsSection.toolkitReferencesLoad.waitFor({
      state: 'hidden',
    });
    await expect(culturalCompassPage.resultsSection.toolkitReferencesSection).toBeVisible();
    expect(await culturalCompassPage.resultsSection.toolkitReferencesLinks.count()).toBeGreaterThan(0);
    const referencesCount = await culturalCompassPage.resultsSection.toolkitReferencesLinks.count();
    for (let i = 0; i < referencesCount; i++) {
      const linkUrl = await culturalCompassPage.resultsSection.toolkitReferencesLinks.nth(i).getAttribute('href');
      expect(linkUrl).toMatch(/\/files\/[a-zA-Z0-9-_]+#page=\d+/);
    }
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Cultural Compass, etc)
    await expect(page).toHaveURL(BASE_URL_REGEX);

    // Then I will see a fixed side navigation on the left
    await expect(culturalCompassPage.sideNavigationComponent.container).toBeVisible();
  });

  test('[GEN-T335, GEN-T334, GEN-T333] Should be able to see delete icon and delete review', async ({
    culturalCompassPage,
  }) => {
    // Given user is on the cultural compass page and has generated reviews
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);
    // When user navigates to the review section
    // Then the reviews  have a visible delete icon on the  top right corner
    await expect(culturalCompassPage.resultsSection.removeButton).toBeVisible();
    // Then the the user can delete the reviews regardless of status(in progress or completed
    await expect(culturalCompassPage.resultsSection.seeReviewCollapsible).toBeVisible();
    await culturalCompassPage.resultsSection.removeButton.click();
    await expect(culturalCompassPage.resultsSection.seeReviewCollapsible).not.toBeVisible();
    // When Toast message appears
    await expect(culturalCompassPage.undoDeletedReview.toastMessage).toBeVisible();
    // Then the the user can undo the deletion
    await culturalCompassPage.undoDeletedReview.toastUndoButton.click();
    await expect(culturalCompassPage.undoDeletedReview.toastMessage).not.toBeVisible();
    await expect(culturalCompassPage.resultsSection.seeReviewCollapsible).toBeVisible();
    // When Toast message appears
    await culturalCompassPage.resultsSection.removeButton.click();
    await expect(culturalCompassPage.undoDeletedReview.toastMessage).toBeVisible();
    // Then the the user can dismiss
    await culturalCompassPage.undoDeletedReview.toastDismissButton.click();
    await expect(culturalCompassPage.undoDeletedReview.toastMessage).not.toBeVisible();
    await expect(culturalCompassPage.resultsSection.seeReviewCollapsible).not.toBeVisible();
  });

  // Constantly failing on workflow, to be fixed in: https://example.atlassian.net/browse/GEN-990
  test.fixme(
    '[GEN-T370, GEN-T371, GEN-T372, GEN-T373, GEN-T374, GEN-T375, GEN-T376] Should see mandatory CC onboarding when using the app for the first time',
    async ({ page, context, culturalCompassPage }) => {
      // add fake JWT to see automatic onboarding modal
      const jwt = createFakeJwt({});
      await context.addCookies([{ name: 'JWT', value: jwt, path: '/', domain: 'localhost' }]);
      await page.reload();

      // [GEN-T376] - Given I have logged into TasteMaker for the first time and was linked directly to the Cultural Compass app
      // Then I see the TasteMaker onboarding modal
      const platformOnboardingModal = new OnboardingModalComponent(culturalCompassPage.page, 'Try TasteMaker Now');
      await expect(platformOnboardingModal.title).toHaveText('Welcome to TasteMaker');
      // When I complete the TasteMaker onboarding in the modal for the platform
      await platformOnboardingModal.completeOnboarding();
      // Then I will automatically see the mandatory onboarding modal for Cultural Compass as well and I am required to complete it before using the app
      const culturalCompassOnboardingModal = new OnboardingModalComponent(
        culturalCompassPage.page,
        'Complete Training',
        'By proceeding, you agree to engage responsibly with this app'
      );
      await expect(culturalCompassOnboardingModal.title).toHaveText('Welcome to Cultural Compass');

      // [GEN-T370] - Given I have never used the Cultural Compass app before
      // When I land on the CC app via any source
      await page.reload();
      // Then I will automatically see the first page of the mandatory onboarding modal
      await expect(culturalCompassOnboardingModal.title).toHaveText('Welcome to Cultural Compass');
      // And I cannot exit the modal at all except for on the last slide by clicking Complete Training.
      await expect(culturalCompassOnboardingModal.closeButton).not.toBeVisible();
      await expect(culturalCompassOnboardingModal.skipButton).not.toBeVisible();
      // click outside of modal
      await culturalCompassOnboardingModal.clickOutside();
      await expect(culturalCompassOnboardingModal.title).toHaveText('Welcome to Cultural Compass');

      // [GEN-T371] - Given I can see the first slide of the mandatory onboarding modal
      // When I click on the IM Toolkit link
      const imToolkitLink = culturalCompassOnboardingModal.container.getByRole('link', {
        name: 'Inclusive Marketing Toolkit',
      });
      const [newPage] = await Promise.all([page.context().waitForEvent('page'), imToolkitLink.click()]);
      // Then the toolkit will open in a new tab
      expect(newPage.url()).not.toMatch(BASE_URL_REGEX); // we can't check the actual URL because the URL changes if you are not logged in
      expect(page.url()).toMatch(BASE_URL_REGEX);
      await newPage.close();

      // [GEN-T372] - Given I can see the CC mandatory onboarding modal
      // When I click Next
      await culturalCompassOnboardingModal.moveToNextPage();
      // Then I will see the next page of the modal
      expect(await culturalCompassOnboardingModal.getActivePageIndex()).toBe(1);
      // And if I click Back I will see the previous page of the modal
      await culturalCompassOnboardingModal.moveToPreviousPage();
      // And I can see a progress indicator at the bottom of the modal to indicate where I am in the onboarding flow
      expect(await culturalCompassOnboardingModal.getActivePageIndex()).toBe(0);

      // [GEN-T373] - Given I have progressed through all 6 training slides
      // When I view the last slide
      const pagesCount = await culturalCompassOnboardingModal.numOfPages;
      for (let i = 0; i < pagesCount - 1; i++) {
        await culturalCompassOnboardingModal.moveToNextPage();
      }
      // Then I will see fine print underneath the Complete Training button
      await expect(culturalCompassOnboardingModal.disclaimer!).toBeVisible();

      // [GEN-T374] - Given I have progressed through all 6 training slides
      // When I click Complete Training
      await culturalCompassOnboardingModal.moveToNextPage();
      // Then the modal will close and I will see the CC app landing page
      await expect(culturalCompassPage.heading).toBeVisible();
      // And the system will log that I have completed my mandatory CC onboarding training.
      await page.reload();
      await expect(culturalCompassOnboardingModal.container).not.toBeVisible();

      await context.clearCookies();
    }
  );

  test('[GEN-T111, GEN-T112] Should be able to edit and delete the prompt text (files)', async ({
    culturalCompassPage,
  }) => {
    // Given: The user is on the Inclusive Marketing content review page.
    // When: The user has generated a prompt text
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    // GEN-T111 Then: User can edit the prompt in a modal
    const attachedText = culturalCompassPage.sendForReviewSection.form.getByRole('button', {
      name: 'Easy open, easy pour',
    });
    await expect(attachedText).toBeVisible();
    await attachedText.click();
    await expect(culturalCompassPage.sendForReviewSection.editModalTitle).toBeVisible();
    await culturalCompassPage.sendForReviewSection.editTextArea.fill('Correctly edited text');
    await culturalCompassPage.sendForReviewSection.saveEditButton.click();
    await expect(culturalCompassPage.sendForReviewSection.editModalTitle).toBeHidden();
    // GEN-T112 And User can delete the prompt file
    const updatedAttachedText = culturalCompassPage.sendForReviewSection.form.getByRole('button', {
      name: 'Correctly edited text',
    });
    await culturalCompassPage.sendForReviewSection.removeAttachedTextContent('Correctly edited text');
    await expect(updatedAttachedText).not.toBeVisible();
  });

  test('[GEN-T109, GEN-T110, GEN-T113, GEN-T114, GEN-T115, GEN-T116] it should be possible to generate revisions for one or more files with active bundle files', async ({
    page,
    culturalCompassPage,
  }) => {
    // Given The user is inside the inclusive content review page and Check that the “Bundle Files” checkbox is checked by default.
    const isChecked = await culturalCompassPage.sendForReviewSection.bundleContentCheckbox.isChecked();
    expect(isChecked).toBe(true);
    //  When I attach different types of files in a single submission
    //Text
    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    //image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await culturalCompassPage.sendForReviewSection.uploadFilesButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createTestImageFile()]);
    await expect(culturalCompassPage.modal).toBeHidden();
    //GEN-T113 Then: The files will be attached
    await culturalCompassPage.sendForReviewSection.evaluationFocusPicker.click();
    const optionCount = await culturalCompassPage.sendForReviewSection.evaluationFocusListboxOption.count();
    const randomIndex = Math.floor(Math.random() * optionCount);
    const selectedOption = culturalCompassPage.sendForReviewSection.evaluationFocusListboxOption.nth(randomIndex);
    await selectedOption.click();
    await culturalCompassPage.page.keyboard.press('Escape');
    // GEN-T116 - Then: The system treats the selected files as a single package for simultaneous review. The review queue displays the package as a single entry.
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();

    await culturalCompassPage.sendForReviewSection.contentInput.fill(
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.'
    );
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);
    // GEN-T109 Then: The system successfully submits the prompt text. The file is displayed in the review queue.
    // GEN-T110 Then: The system successfully uploads the file. The text is displayed as a a file in the review queue.
    // GEN-T114 - Then: AI is able to understand and provide feedback.
    //GEN-T115 - Then: More than one file can be reviewed at the same time. Multiple generations of content can be run at the same time in the same chat.
    const responseSections = await culturalCompassPage.resultsSection.seeReviewCollapsible.all();
    expect(responseSections).toHaveLength(2);
  });

  test('[GEN-T118, GEN-T119] Should Handle File Upload Errors', async ({ page, culturalCompassPage }) => {
    // Given: The user is on the Inclusive Marketing content review page.
    // When: The user attempts to upload a file with an invalid file type
    const fileChooserPromise = page.waitForEvent('filechooser');
    await culturalCompassPage.sendForReviewSection.uploadFilesButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([createInvalidFile()]);
    await expect(culturalCompassPage.modal).toBeHidden();
    //then a warning icon is displayed
    await expect(culturalCompassPage.sendForReviewSection.alertIcon).toBeVisible();
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);
    //And when the request is sent, an error message is displayed in the response.
    await expect(culturalCompassPage.resultsSection.reviewContainer).toContainText(
      'There was an error when trying to review the content'
    );
  });

  test('[GEN-T412, GEN-T413, GEN-T414, GEN-T415, GEN-T416] Should be able share link for CC review', async ({
    page,
    culturalCompassPage,
  }) => {
    async function copyShareableLink() {
      // GEN-T412 - Should be able to copy the link using the shareable cta
      // When the user clicks the button to copy shareable link for a specific review card
      await culturalCompassPage.resultsSection.copyLinkComponent.button.click();
      // Then the link should be successfully added to their clipboard
      const reviewLink = await page.evaluate(() => navigator.clipboard.readText());
      expect(reviewLink).toMatch(GENERATION_URL_REGEX);
      // And the app will indicate that the review has been copied
      await expect(culturalCompassPage.resultsSection.copyLinkComponent.confirmation).toBeVisible();

      return reviewLink;
    }

    // Given the user has submitted content for review with Cultural Compass
    const textContent =
      'Easy open, easy pour. Our new Classic Tomato Ketchup packet design makes enjoying your favorite condiment easier for everyone.';
    await culturalCompassPage.sendForReviewSection.contentInput.fill(textContent);
    await culturalCompassPage.sendForReviewSection.submitTextContent.click();
    const { selectedFocus } = await culturalCompassPage.sendForReviewSection.selectRandomInclusivityFocus();
    // first generation
    await culturalCompassPage.sendForReviewSection.sendForReviewButton.click();
    await waitForGenAi(culturalCompassPage);
    await culturalCompassPage.resultsSection.generatingLoad.waitFor({
      state: 'hidden',
    });
    await expect(culturalCompassPage.resultsSection.reviewContent).toBeVisible();
    const firstReview = (await culturalCompassPage.resultsSection.reviewContent.innerText()) || '';
    const firstReviewLink = await copyShareableLink();
    // second generation
    await culturalCompassPage.resultsSection.regenerateButton.click();
    await culturalCompassPage.resultsSection.generatingLoad.waitFor({
      state: 'hidden',
    });
    const secondReviewLink = await copyShareableLink();
    expect(firstReviewLink).not.toEqual(secondReviewLink);

    // GEN-T413, GEN-T415 - Should be able to open a page specific for the shareable link
    // Given someone has shared a cultural compass review for a general review link with me
    const newPage = await culturalCompassPage.page.context().newPage();
    // When I go to that link
    await newPage.goto(firstReviewLink);
    await page.close();
    // Then I will see a simple page with only the inputs and outputs of the review, any inclusivity focus areas that were applied, and any related toolkit references
    const reviewPageContent = newPage.locator('main');
    await expect(reviewPageContent).toContainText(textContent.substring(0, 20));
    await expect(reviewPageContent).toContainText(selectedFocus);
    await expect(reviewPageContent).toContainText(firstReview);
    await expect(reviewPageContent).toContainText('Related Toolkit references');

    // GEN-T416 - Should be able to copy the review text from a shareable link
    // When I click the copy button
    const copyButton = new CopySectionComponent(newPage);
    await copyButton.button.click();
    // Then all of the text from the review output, excluding the toolkit references, will be copied to my clipboard.
    const clipboardText = await newPage.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(firstReview);

    await newPage.close();
  });
});
