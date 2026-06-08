import { test } from '../fixtures/pages/page-objects.fixture';
import { getElementSize, createTestFile, createLongPrompt, waitForGenAi } from '../components/commons/helpers';
import { expect } from '@playwright/test';
import { textChat } from '@/chat/textChat';
import selfServePromptData from '@fixtures/test-data/self-serve-prompt-data.json';
import * as path from 'path';
import * as fs from 'fs';
import { SelfServePage } from '@pageObjects/pages/gen-ai/self-serve.page';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';

const BASE_URL_REGEX = new RegExp(`.*${APPS_DETAILS.SELF_SERVE.url}$`);
const GENERATION_URL_REGEX = new RegExp(
  `.*${APPS_DETAILS.SELF_SERVE.url}/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$`
);

test.describe(`Self Serve Page Tests`, () => {
  test.beforeEach(async ({ selfservePage }) => {
    await selfservePage.goto();
    // this just makes the tests faster, but not all the self-serve prompts work quite as expected
    await selfservePage.chatInputFormSection.form
      .getByRole('combobox', { name: 'Model' })
      .selectOption({ label: 'Gemini 2.0 Flash' });
  });

  test('[GEN-T75] Should Navigate User to Information Page on Learn More Link Click', async ({
    page,
    selfservePage,
  }) => {
    // Given I am on the Self-Serve page
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);
    await expect(selfservePage.chatOutputDisplaySection.infoIcon).toBeVisible();
    await expect(selfservePage.chatOutputDisplaySection.infoText).toBeVisible();
    await expect(selfservePage.chatOutputDisplaySection.infoSecondaryText).toBeVisible();
    await expect(selfservePage.chatOutputDisplaySection.infoSecondaryLink).toBeVisible();
    // When I click the "Learn more here" link
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      selfservePage.chatOutputDisplaySection.infoSecondaryLink.click(),
    ]);
    await expect(newPage).toHaveURL(new RegExp(`.*${APPS_DETAILS.SELF_SERVE.url}/about$`));
  });

  test('[GEN-T60] Should Present Kickoff Suggestions to User to Facilitate Conversation Initiation', async ({
    selfservePage,
  }) => {
    // Given I am a user using selfserve
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);
    // When I access the chatbot page
    // Then I should be presented with kickoff suggestions relevant to my use case
    const buttonCount = await selfservePage.chatOutputDisplaySection.kickoffButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      await expect(selfservePage.chatOutputDisplaySection.kickoffButtons.nth(i)).toBeVisible();
      // And click on the kickoff suggestions provides that the suggestion as prompt input value
      await selfservePage.chatOutputDisplaySection.kickoffButtons.nth(i).click();
      const buttontext = await selfservePage.chatOutputDisplaySection.kickoffButtons.nth(i).textContent();
      const promptText = await selfservePage.chatInputFormSection.promptInput.textContent();
      expect(buttontext).toContain(promptText);
    }
  });

  test('[GEN-T63] Should Hide Kickoff Suggestions When User Starts Conversation by Typing', async ({
    selfservePage,
  }) => {
    // Given I am a user using selfserve
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);
    // When I initiate a conversation by typing a message and pressing send
    const buttonCount = await selfservePage.chatOutputDisplaySection.kickoffButtons.count();
    await selfservePage.chatInputFormSection.promptInput.fill('hello');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    // Then the chatbot should hide the kickoff suggestions and the learn more banner
    await expect(selfservePage.chatOutputDisplaySection.infoComponent).not.toBeVisible();
    for (let i = 0; i < buttonCount; i++) {
      await expect(selfservePage.chatOutputDisplaySection.kickoffButtons.nth(i)).not.toBeVisible();
    }
  });

  test('[GEN-T80] Should Return Relevant Response To Prompt, Based On AI Relevance Evaluation', async ({
    selfservePage,
  }) => {
    // Given a user has entered a prompt in the chat input
    const kickOffIndex = 0;
    await selfservePage.chatOutputDisplaySection.kickoffButtons.nth(kickOffIndex).click();
    const promptText = await selfservePage.chatInputFormSection.promptInput.textContent();
    if (promptText === null) {
      throw new Error('Initial prompt text was null.');
    }
    // When the user submits the prompt
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatInputFormSection.submitPrompt.isEnabled({ timeout: 30000 });
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const aiGeneratedResponse = await selfservePage.chatOutputDisplaySection.promptResponse.textContent();
    if (aiGeneratedResponse === null) {
      throw new Error('AI-generated response text was null.');
    }
    // Then a relevance score is calculated by comparing the prompt and response using AI
    const relevanceEvaluationPrompt = ` Given you are a third-party QA context validator.

      Consider the following prompt:  ${promptText} 
      And the following generated response: ${aiGeneratedResponse} 
      ${selfServePromptData['evaluateTextResponseRelevance'].prompt}`;
    const { text: relevanceScoreText } = await textChat({ prompt: relevanceEvaluationPrompt });
    const trimmedScoreText = relevanceScoreText.trim();
    const relevanceScore = parseFloat(trimmedScoreText);
    // AND the relevance score is above 70, indicating sufficient relevance
    if (relevanceScore > 70) {
      await expect(selfservePage.chatOutputDisplaySection.promptResponse).toBeVisible();
      expect(relevanceScore).toBeGreaterThan(70);
    } else {
      console.warn(`Warning: Non-critical condition did not pass.  Score was: ${relevanceScore}`);
      console.warn(`> ${promptText}\n> ${aiGeneratedResponse}`);
    }
  });

  test('[GEN-T72] Expand Input Field for Multiline Input on Checkbox Selection', async ({ selfservePage }) => {
    // Given I am a user using selfserve
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);

    const promptText = 'Acme Corporation\nBrand name in multi-line prompt test';
    // When I select the "Multiline" checkbox
    await selfservePage.chatInputFormSection.multilineCheckbox.click();
    // Then the input field should accommodate multiple lines of text
    const initialSize = await getElementSize(selfservePage.chatInputFormSection.promptInput);
    await selfservePage.chatInputFormSection.promptInput.fill(promptText);
    await selfservePage.chatInputFormSection.promptInput.press('Enter');
    const newSize = await getElementSize(selfservePage.chatInputFormSection.promptInput);
    const promptTextCount = await selfservePage.chatInputFormSection.promptText.count();
    expect(newSize.width).toBe(initialSize.width);
    expect(newSize.height).toBeGreaterThan(initialSize.height);
    expect(newSize.height).toBeLessThanOrEqual(0.6 * (selfservePage.page.viewportSize()?.height ?? 0)); //max prompt window size is 60vh
    expect(promptTextCount).toBeGreaterThan(1); //greater than one means multiline is enabled
  });

  test('[GEN-T73] Should Open File Selection Dialog on Add File Action', async ({ page, selfservePage }) => {
    const fileName = 'test.txt';
    const fileContent = 'This is a test file';
    const filePath = path.join(__dirname, fileName);
    await createTestFile(filePath, fileContent);

    // Given I am a user using selfserve
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);
    await expect(selfservePage.chatInputFormSection.addFileButton).toBeVisible();
    // When I click the "Add File" button
    const fileChooserPromise = page.waitForEvent('filechooser');
    await selfservePage.chatInputFormSection.addFileButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([filePath]);
    await expect(selfservePage.chatInputFormSection.promptInput).toContainText(fileName);
    fs.unlinkSync(filePath);
  });

  test('[GEN-T93] Should open feedback form in a new tab when feedback link is clicked', async ({
    page,
    selfservePage,
  }) => {
    // Given the user is on the Self-Serve page
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);

    // When the user clicks the feedback button
    // Then a new browser tab should open, displaying a feedback form. The original page should remain open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      selfservePage.feedbackComponent.link.click(),
    ]);

    await expect(newPage).toHaveURL('https://airtable.com/YOUR_AIRTABLE_URL_HERE');
    await expect(page).toHaveURL(BASE_URL_REGEX);
  });

  test('[GEN-T150] Should clear messages when clicking new chat', async ({ selfservePage }) => {
    test.setTimeout(120 * 1000);
    await selfservePage.chatInputFormSection.promptInput.fill('hello');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);
    await selfservePage.page.waitForURL(/\/[0-9a-f-]+$/);

    // Given there are messages on the page
    expect(await selfservePage.chatOutputDisplaySection.promptResponse.count()).toBeGreaterThan(0);

    // When I click New Chat
    await selfservePage.chatInputFormSection.newChat.click();

    // Then there is no more output, and I can create a new chat
    expect(await selfservePage.chatOutputDisplaySection.promptResponse.count()).toBe(0);
    expect(await selfservePage.chatOutputDisplaySection.kickoffButtons.count()).toBeGreaterThan(0);
  });

  test('[GEN-T129] Should Update URL as Conversation Progresses', async ({ page, selfservePage }) => {
    // Given a user is interacting with self-serve
    await expect(selfservePage.page).toHaveURL(BASE_URL_REGEX);

    // When the user progresses through the conversation by adding multiple prompts and receiving responses
    const prompts = ['Hello', 'What is the weather like today?'];
    let previousGenerationID = null;
    for (const prompt of prompts) {
      await selfservePage.chatInputFormSection.promptInput.fill(prompt);
      await selfservePage.chatInputFormSection.submitPrompt.click();
      await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });

      const currentUrl = page.url();
      const match = currentUrl.match(GENERATION_URL_REGEX);
      const currentGenerationID = match ? match[1] : null;

      // Then the browser URL should be updated to reflect the current state of the conversation
      await expect(page).toHaveURL(GENERATION_URL_REGEX); // Matches /self-serve/[generationID]
      if (previousGenerationID) {
        expect(currentGenerationID).not.toEqual(previousGenerationID);
      }

      previousGenerationID = currentGenerationID;
    }
  });

  test('[GEN-T130] Should Restore Conversation from Shared URL', async ({ page, selfservePage }) => {
    // Given a user has a URL representing a previous self-serve conversation
    const userInput = 'Hello';
    await selfservePage.chatInputFormSection.promptInput.fill(userInput);
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const initialResponse = await selfservePage.chatOutputDisplaySection.promptResponse.textContent();
    const conversationUrl = page.url();

    // When the user pastes the URL into the address bar and navigates to it
    const newPage = await selfservePage.page.context().newPage();
    await newPage.goto(conversationUrl);
    const newSelfServePage = new SelfServePage(newPage);
    await page.close();

    // Then the user should be able to view the complete conversation history
    await newSelfServePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const restoredUserInput = await newSelfServePage.chatOutputDisplaySection.userMessage.textContent();
    expect(restoredUserInput).toEqual(userInput);
    const restoredResponse = await newSelfServePage.chatOutputDisplaySection.promptResponse.textContent();
    expect(restoredResponse).toEqual(initialResponse);

    // And the user should be able to continue the conversation from where it left off
    await newSelfServePage.chatInputFormSection.promptInput.fill('What is the weather like today?');
    await newSelfServePage.chatInputFormSection.submitPrompt.click();
    await newSelfServePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const newResponse = await newSelfServePage.chatOutputDisplaySection.promptResponse.textContent();
    expect(newResponse).not.toEqual(restoredResponse);

    await newPage.close();
  });

  test('[GEN-T131] Should Handle Invalid or Expired URLs', async ({ page, selfservePage }) => {
    // Given a user has an invalid or expired URL for a self-serve conversation
    const invalidUrl = `${APPS_DETAILS.SELF_SERVE.url}/12345`;

    // When the user attempts to access the URL
    await page.goto(invalidUrl);

    // THEN the system should produce an error
    await expect(page.getByText("Oops! We couldn't find that page.")).toBeVisible();
    // AND the user should be able to navigate back to the main form
    await expect(selfservePage.sideNavigationComponent.selfServeLink).toBeVisible();
    await expect(selfservePage.sideNavigationComponent.selfServeLink).toHaveAttribute('aria-current', 'page');
  });

  test('[GEN-T104] Should Display Notice After Context Limit is reached', async ({ selfservePage }) => {
    test.setTimeout(120 * 1000);

    // Given a user has an existing self-serve conversation with a context length exceeding the configured limit
    const longString = createLongPrompt();
    await selfservePage.chatInputFormSection.promptInput.fill(longString);
    await selfservePage.chatInputFormSection.submitPrompt.click();

    // When the context length reaches the configured limit
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden', timeout: 120 * 1000 });

    // Then a dismissible notice (toast) appears on the page
    await expect(selfservePage.refreshToastComponent.container).toBeVisible();
    await expect(selfservePage.refreshToastComponent.closeButton).toBeVisible();
  });

  test('[GEN-T106] Should Restart Conversation Without Summary', async ({ page, selfservePage }) => {
    // Given a user has an existing self-serve conversation with a context length exceeding the configured limit
    const longString = createLongPrompt();
    await selfservePage.chatInputFormSection.promptInput.fill(longString);
    await selfservePage.chatInputFormSection.submitPrompt.click();

    // When the context length reaches the configured limit and the reminder appears and the user clicks on "Restart"
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    await selfservePage.refreshToastComponent.restartButton.click();
    await selfservePage.restartSessionDialogComponent.container.waitFor({ state: 'visible' });
    await selfservePage.restartSessionDialogComponent.newChatButton.click();

    // Then the conversation is reset, the page is refreshed and the context is empty
    expect(await selfservePage.chatOutputDisplaySection.promptResponse.count()).toBe(0);
    expect(await selfservePage.chatOutputDisplaySection.kickoffButtons.count()).toBeGreaterThan(0);
    await expect(page).toHaveURL(BASE_URL_REGEX);
    await expect(selfservePage.refreshToastComponent.container).toBeHidden();
  });

  test('[GEN-T105] Should Dismiss notice and continue Chat', async ({ selfservePage }) => {
    // Given a user has an existing self-serve conversation with a context length exceeding the configured limit
    const longString = createLongPrompt();
    await selfservePage.chatInputFormSection.promptInput.fill(longString);
    await selfservePage.chatInputFormSection.submitPrompt.click();

    // When the context length reaches the configured limit and the reminder appears and the user dismisses the notice
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    await selfservePage.refreshToastComponent.closeButton.click();

    // Then the notice disappears from the page, the conversation continues and the notice does not reappear
    expect(await selfservePage.chatOutputDisplaySection.promptResponse.count()).toBeGreaterThan(0);
    expect(await selfservePage.chatOutputDisplaySection.kickoffButtons.count()).toBe(0);

    await selfservePage.chatInputFormSection.promptInput.fill('Thank you');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });

    await expect(selfservePage.refreshToastComponent.container).toBeHidden();
  });

  test('[GEN-T107] Should Restart Conversation With Summary', async ({ page, selfservePage }) => {
    // Given a user has an existing self-serve conversation with a context length exceeding the configured limit
    const longString = createLongPrompt();
    await selfservePage.chatInputFormSection.promptInput.fill(longString);
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);

    // When the context length reaches the configured limit and the reminder appears and the user selects "Restart"
    await expect(selfservePage.refreshToastComponent.container).toBeVisible();
    await selfservePage.refreshToastComponent.restartButton.click();

    // Then a dialog is presented with the summary so the user can decide if they want to proceed with it
    await expect(selfservePage.restartSessionDialogComponent.container).toBeVisible();
    await expect(selfservePage.refreshToastComponent.container).toBeHidden();
    await selfservePage.restartSessionDialogComponent.summaryLoading.waitFor({ state: 'hidden' });

    // When the user decides to proceed with the summary
    await selfservePage.restartSessionDialogComponent.useSummaryButton.click();

    // Then the conversation is reset and a summary of the previous conversation is presented
    await expect(page).toHaveURL(new RegExp(`.*${APPS_DETAILS.SELF_SERVE.url}\\?context=.*`));
    expect(await selfservePage.chatOutputDisplaySection.promptResponse.count()).toBe(0);
    expect(await selfservePage.chatOutputDisplaySection.kickoffButtons.count()).toBe(0);
    await expect(selfservePage.chatOutputDisplaySection.initialContext).toBeVisible();
  });

  test('[GEN-T178] Should be able to continue conversation if user decides to cancel restart', async ({
    selfservePage,
  }) => {
    // Given a user has an existing self-serve conversation with a context length exceeding the configured limit
    const longString = createLongPrompt();
    await selfservePage.chatInputFormSection.promptInput.fill(longString);
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);

    // When the user decides to discard the generated conversation summary
    await expect(selfservePage.refreshToastComponent.container).toBeVisible();
    await selfservePage.refreshToastComponent.restartButton.click();
    await expect(selfservePage.restartSessionDialogComponent.container).toBeVisible();
    await selfservePage.restartSessionDialogComponent.cancelButton.click();

    // Then the user should be able to continue the conversation from where it left off
    await expect(selfservePage.restartSessionDialogComponent.container).toBeHidden();
    await expect(selfservePage.chatOutputDisplaySection.userMessage).toBeVisible();
    await expect(selfservePage.chatOutputDisplaySection.promptResponse).toBeVisible();
    await selfservePage.chatInputFormSection.promptInput.fill('Thank you');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
  });

  test('[GEN-T173] Should retrieve the self serve conversations when pressing browser back or forward ', async ({
    selfservePage,
  }) => {
    // ​​​​​Given user has a conversation history and has started 'new chat' conversations
    // start with Tomato Ketchup
    await selfservePage.chatInputFormSection.promptInput.fill('Describe Tomato Ketchup');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);

    await selfservePage.page.waitForURL(/\/[0-9a-f-]+$/);

    // send a second message - whole conversation should be treated as one history entry
    await selfservePage.chatInputFormSection.promptInput.fill('Write a poem about Tomato Ketchup');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });

    // create a new chat
    await selfservePage.chatInputFormSection.newChat.click();
    await selfservePage.page.waitForURL(BASE_URL_REGEX);

    // new chat - Classic Cream Cheese
    await selfservePage.chatInputFormSection.promptInput.fill('Describe Classic Cream Cheese');
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);
    await selfservePage.page.waitForURL(/\/[0-9a-f-]+$/);

    // WHEN the user clicks back

    await selfservePage.page.goBack({ waitUntil: 'networkidle' });

    // THEN we should be back on the ketchup conversation
    await expect(selfservePage.chatOutputDisplaySection.conversationHistory).toContainText('Describe Tomato Ketchup');
    await expect(selfservePage.chatOutputDisplaySection.conversationHistory).toContainText('poem');

    // WHEN the user clicks back again
    await selfservePage.page.goBack({ waitUntil: 'networkidle' });

    // THEN we should leave the whole conversation behind
    await expect(selfservePage.chatOutputDisplaySection.conversationHistory).toBeHidden();

    // WHEN we go forward twice
    await selfservePage.page.goForward({ waitUntil: 'networkidle' });
    await selfservePage.page.goForward({ waitUntil: 'networkidle' });

    // THEN we should be back on the cream cheese conversation
    await expect(selfservePage.chatOutputDisplaySection.conversationHistory).toContainText(
      'Describe Classic Cream Cheese'
    );
  });

  test('[GEN-T137] Should verify shareable link button copies page URL to clipboard', async ({
    page,
    selfservePage,
  }) => {
    const copyLinkButton = selfservePage.chatInputFormSection.copyPageLinkComponent.button;

    // Button should be hidden until URL generated
    await expect(copyLinkButton).toBeHidden();

    const userInput = 'Hello';
    await selfservePage.chatInputFormSection.promptInput.fill(userInput);
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await waitForGenAi(selfservePage);

    const conversationUrl = page.url();

    await expect(copyLinkButton).toBeVisible();
    await copyLinkButton.click();

    // Link should copied to clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toEqual(conversationUrl.trim());

    // Button should be in "Copied" state
    const copiedButton = selfservePage.chatInputFormSection.copyPageLinkComponent.confirmation;
    await expect(copiedButton).toBeVisible();
  });

  test('[GEN-T189] Should verify that the side navigation is visible on any page after login', async ({
    page,
    selfservePage,
  }) => {
    // Given I have logged into the tool
    // When I view any page on the app (Self Serve, Home, Concept Innovation, Inclusive Marketing, etc)
    await expect(page).toHaveURL(BASE_URL_REGEX);

    // Then I will see a fixed side navigation on the left
    await expect(selfservePage.sideNavigationComponent.container).toBeVisible();
  });

  test('[GEN-T192] Should verify that the selected navigation item is highlighted or indicated with a "selected" state', async ({
    selfservePage,
  }) => {
    // Given I have logged into the tool and am on the a "specific" page
    // When I view the side navigation
    // Then I see the "specific" item in a ‘selected’ state to highlight that it is the current page
    await expect(selfservePage.sideNavigationComponent.selfServeLink).toHaveAttribute('aria-current', 'page');
  });

  test('[GEN-T121, GEN-501] Should navigate to self serve page', async ({ page, selfservePage }) => {
    // Given a user is on the GenAI landing page
    await selfservePage.sideNavigationComponent.homeLink.click();

    // When the user clicks the "button" navigation bar
    await selfservePage.sideNavigationComponent.selfServeLink.click();

    // Then the selected option-page should be displayed.
    await expect(page).toHaveURL(BASE_URL_REGEX);
    await expect(selfservePage.chatOutputDisplaySection.infoComponent).toBeVisible();
    await expect(selfservePage.chatInputFormSection.tmToolCheckbox).toBeVisible();
  });
});
