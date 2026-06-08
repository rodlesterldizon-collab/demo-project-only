import { Locator, Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { AppCardsSection } from '../sections/app-cards.section';

export class HomePage extends genAiBasePage {
  readonly greeting: Locator;
  readonly banner: Locator;
  readonly bannerTitle: Locator;
  readonly bannerDescription: Locator;
  readonly bannerButton: Locator;
  readonly appCardsSection: AppCardsSection;
  readonly faqTitle: Locator;
  readonly faqSection: Locator;
  readonly seeAllFAQsLink: Locator;
  readonly visitTeams: Locator;
  readonly emailUs: Locator;
  readonly faqQuestion: Locator;
  readonly faqAnswer: Locator;
  readonly getInspiredTitle: Locator;
  readonly getInspiredSection: Locator;
  readonly getInspiredDescription: Locator;
  readonly getInspiredCard: Locator;
  readonly getInspiredCardImage: Locator;
  readonly getInspiredCardTitle: Locator;
  readonly getInspiredCardDescription: Locator;
  readonly getInspiredCardButton: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByRole('heading').filter({ hasText: 'Hello' });
    this.banner = page.getByRole('banner');
    this.bannerTitle = this.banner.getByRole('heading').filter({ hasText: 'Welcome to TasteMaker' });
    this.bannerDescription = this.banner
      .getByRole('paragraph')
      .filter({ hasText: 'TasteMaker is your creative partner' });
    this.bannerButton = this.banner.getByRole('button', { name: 'Take a tour' });
    this.appCardsSection = new AppCardsSection(page);
    this.faqTitle = page.getByRole('heading', { name: `We're here to help` });
    this.faqSection = page.getByLabel('Frequently Asked Questions');
    this.seeAllFAQsLink = this.faqSection.getByRole('link', { name: 'See all FAQs' });
    this.visitTeams = this.faqSection.getByRole('link', { name: 'Visit our Teams channel' });
    this.emailUs = this.faqSection.getByRole('link', { name: 'Email us' });
    this.faqQuestion = this.faqSection.getByRole('heading', { level: 3 });
    this.faqAnswer = this.faqSection.locator('*[role="heading"][aria-level="3"] + div');
    this.getInspiredSection = page.getByLabel('Inspirations from Tastemaker');
    this.getInspiredTitle = this.getInspiredSection.getByRole('heading', { name: 'Get inspired' });
    this.getInspiredDescription = this.getInspiredSection.locator('p').first();
    this.getInspiredCard = this.getInspiredSection.getByRole('link');
    this.getInspiredCardImage = this.getInspiredCard.locator('img');
    this.getInspiredCardTitle = this.getInspiredCard.locator('p.font-bold');
    this.getInspiredCardDescription = this.getInspiredCard.locator('p:not(.font-bold)');
    this.getInspiredCardButton = this.getInspiredCard.getByText('Recreate this example');
  }

  async getInspiredCardCount() {
    const totalCards = this.getInspiredCard.count();
    return totalCards;
  }

  async getAccordionCount() {
    const totalAccordions = this.faqQuestion.count();
    return totalAccordions;
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }
}
