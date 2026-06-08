import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';

test.describe(`Home Page Tests`, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('[GEN-T204, GEN-T205, GEN-T206, GEN-T207] Should display the app card section and app cards then when user clicks on a card the user can be directed to that page url', async ({
    homePage,
  }) => {
    // Given I have landed on the homepage
    // When I view the app card section
    // Then I will see a section title and description
    await expect(homePage.appCardsSection.appCardSectionHeading).toBeVisible();
    await expect(homePage.appCardsSection.appCardSectionDescription).toBeVisible();
    // When I view the app cards
    const cardCount = await homePage.appCardsSection.getAppCardsCount();
    // Then I will see 3 column cards displayed horizontally
    // And Then should display the correct image, title, description, and button for each card
    for (let i = 0; i < cardCount; i++) {
      const appCard = homePage.appCardsSection.getAppCard(i);
      await expect(appCard.root).toBeVisible();
      await expect(appCard.image).toBeVisible();
      await expect(appCard.title).toBeVisible();
      await expect(appCard.description).toBeVisible();
      // When I hover on a card
      await homePage.appCardsSection.getAppCard(i).root.hover();
      // Then the button is visible
      await expect(homePage.appCardsSection.getAppCard(i).button).toBeVisible();
      // When I click on a card
      const hrefValue = await homePage.appCardsSection.getAppCard(i).link.getAttribute('href');
      await Promise.all([
        homePage.page.waitForURL((url) => url.pathname === hrefValue),
        homePage.appCardsSection.appCards.nth(i).click(),
      ]);
      // Then I will be directed to the linked page
      expect(homePage.page.url()).toContain(hrefValue);
      await homePage.page.goBack();
      await homePage.page.waitForLoadState();
    }
  });

  test('[GEN-T186, GEN-T203] Should display a personalized greeting on the homepage', async ({ homePage }) => {
    // Given I have landed on the homepage
    // When I navigate to the homepage
    // Then I should see a personalized greeting
    await expect(homePage.greeting).toBeVisible();

    // When I view the homepage banner
    // Then I will see a bold title, description, button
    await expect(homePage.bannerTitle).toBeVisible();
    await expect(homePage.bannerDescription).toBeVisible();
    await expect(homePage.bannerButton).toBeVisible();
  });

  test('[GEN-T211, GEN-T212, GEN-T213, GEN-T214, GEN-T215] Should display the modal screens and elements then also close the modal ', async ({
    homePage,
  }) => {
    // Given I am on the homepage
    // When I click on the take tour on the hero banner
    await homePage.bannerButton.click();

    const numOfPages = await homePage.onboardingModalComponent.numOfPages;
    // Then I will see an elements of each screen
    for (let i = 0; i < numOfPages; i++) {
      await expect(homePage.onboardingModalComponent.container).toBeVisible();
      await expect(homePage.onboardingModalComponent.title).toBeVisible();
      await expect(homePage.onboardingModalComponent.progressCounter.nth(i)).toHaveAttribute('aria-current', 'step');
      await expect(homePage.onboardingModalComponent.closeButton).toBeVisible();

      if (i === 0) {
        await expect(homePage.onboardingModalComponent.skipButton).toBeVisible();
      } else {
        await expect(homePage.onboardingModalComponent.backButton).toBeVisible();
      }

      if (i === numOfPages - 1) {
        await expect(homePage.onboardingModalComponent.completeButton).toBeVisible();
        await homePage.onboardingModalComponent.completeButton.click();
        await expect(homePage.onboardingModalComponent.container).not.toBeVisible();
      } else {
        await expect(homePage.onboardingModalComponent.nextButton).toBeVisible();
        await homePage.onboardingModalComponent.nextButton.click();
      }
    }
    // When I press back
    await homePage.bannerButton.click();
    await homePage.onboardingModalComponent.nextButton.click();
    await expect(homePage.onboardingModalComponent.backButton).toBeVisible();
    // Then I press back then I will see previous screens
    await homePage.onboardingModalComponent.backButton.click();
    await expect(homePage.onboardingModalComponent.backButton).not.toBeVisible();
    await expect(homePage.onboardingModalComponent.skipButton).toBeVisible();

    // When I press X
    // Then the onboarding modal will be closed
    await homePage.onboardingModalComponent.closeButton.click();
    await expect(homePage.onboardingModalComponent.container).not.toBeVisible();

    // When I press skip
    await homePage.page.waitForLoadState();
    await homePage.bannerButton.click();
    // Then the onboarding modal will be closed
    await homePage.onboardingModalComponent.skipButton.click();
    await expect(homePage.onboardingModalComponent.container).not.toBeVisible();
  });

  test('[GEN-T208, GEN-T209] Should display the FAQ section question and answers', async ({ homePage }) => {
    // Given I have landed on the homepage
    // When I navigate to the FAQ section
    // Then I should see a section title, help links
    await expect(homePage.faqTitle).toBeVisible();

    await expect(homePage.seeAllFAQsLink).toBeVisible();
    // When I click on FAQs link
    await homePage.seeAllFAQsLink.click(), await homePage.page.waitForURL(`**/help-center`);
    // Then I will be directed to the help center
    expect(homePage.page.url()).toContain('help-center');
    await homePage.page.goBack();
    await homePage.page.waitForLoadState();

    await expect(homePage.visitTeams).toBeVisible();
    const [newPageVisitTeams] = await Promise.all([
      homePage.page.context().waitForEvent('page'),
      homePage.visitTeams.click(),
    ]);
    // add a wildcard to match microsoft teams link
    const teamsLink = /https:\/\/teams\.microsoft\.com\/dl\/launcher\/launcher\.html\?.*type=channel.*/;
    await newPageVisitTeams.waitForLoadState();
    expect(newPageVisitTeams.url()).toMatch(teamsLink);
    await expect(homePage.page).toHaveURL('/');

    await expect(homePage.emailUs).toBeVisible();
    const emailLink = await homePage.emailUs.getAttribute('href');
    const expectedMailtoLink = 'mailto:support@example.com';
    expect(emailLink).toBe(expectedMailtoLink);

    // Then I should see a question and answers
    const accordionCount = await homePage.getAccordionCount();
    for (let i = 0; i < accordionCount; i++) {
      await expect(homePage.faqQuestion.nth(i)).toBeVisible();
      await expect(homePage.faqAnswer.nth(i)).toBeVisible();

      const accordionState = await homePage.faqQuestion.nth(i).getAttribute('data-state');
      expect(accordionState).toBe('open');

      await homePage.faqQuestion.nth(i).click();

      const newAccordionState = await homePage.faqQuestion.nth(i).getAttribute('data-state');
      expect(newAccordionState).toBe('closed');
      await expect(homePage.faqAnswer.nth(i)).not.toBeVisible();
    }
  });

  test('[GEN-230, GEN-T231] Should display the Get Inspired section title, description, and cards content', async ({
    homePage,
  }) => {
    // Given I have landed on the homepage
    // When I navigate to the Get Inspired section
    // Then I should see a section titled "Get inspired"
    await expect(homePage.getInspiredTitle).toBeVisible();
    await expect(homePage.getInspiredDescription).toBeVisible();
    const cardCount = await homePage.getInspiredCardCount();
    //prod static url IDs
    const expectedURLs = [
      'https://app.prd.example.com/concept_innovation/50049386-638b-4235-89ef-53f069a6c0ab',
      'https://app.prd.example.com/self-serve/8b3cd762-fb86-4a11-bb35-1b3d00e57713',
    ];
    // Then each card should have: | Element | | Image | | Title | | Description | | Button | Button link
    for (let i = 0; i < cardCount; i++) {
      await expect(homePage.getInspiredCard.nth(i)).toBeVisible();
      await expect(homePage.getInspiredCardImage.nth(i)).toBeVisible();
      await expect(homePage.getInspiredCardTitle.nth(i)).toBeVisible();
      await expect(homePage.getInspiredCardDescription.nth(i)).toBeVisible();
      await expect(homePage.getInspiredCardButton.nth(i)).toBeVisible();
      await expect(homePage.getInspiredCard.nth(i)).toHaveAttribute('href', expectedURLs[i]);
    }
  });
});
