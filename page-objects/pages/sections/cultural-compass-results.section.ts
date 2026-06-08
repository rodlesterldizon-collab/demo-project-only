import { CopySectionComponent } from '@pageObjects/components/copy-section.component';
import { CopyShareableLinkComponent } from '@pageObjects/components/copy-shareable-link.component';
import { Locator, Page } from '@playwright/test';

export class CulturalCompassResultsSection {
  readonly page: Page;
  readonly root: Locator;
  readonly reviewCell: Locator;
  readonly imageContent: Locator;
  readonly evaluationFocus: Locator;
  readonly generatingLoad: Locator;
  readonly textAttachment: Locator;
  readonly seeReviewCollapsible: Locator;
  readonly reviewContainer: Locator;
  readonly reviewContent: Locator;
  readonly removeButton: Locator;
  readonly removeTooltip: Locator;
  readonly regenerateButton: Locator;
  readonly regenerateTooltip: Locator;
  readonly copyReviewComponent: CopySectionComponent;
  readonly copyLinkComponent: CopyShareableLinkComponent;
  readonly reviewPreviousResponse: Locator;
  readonly reviewNextResponse: Locator;
  readonly toolkitReferencesLoad: Locator;
  readonly toolkitReferencesSection: Locator;
  readonly toolkitReferencesLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.locator('main');
    this.reviewCell = this.root.locator('li');
    this.imageContent = this.reviewCell.locator('img');
    this.evaluationFocus = this.reviewCell.locator('div:has-text("Inclusivity focus:")');
    this.generatingLoad = this.reviewCell.getByText('Generating review');
    this.textAttachment = this.reviewCell.locator('button[aria-haspopup="dialog"]');
    this.seeReviewCollapsible = this.reviewCell.getByText('See review');
    this.reviewContainer = this.seeReviewCollapsible.locator('+ [data-state="open"]');
    this.reviewContent = this.reviewContainer.getByLabel('Content review');
    this.removeButton = this.reviewCell.getByRole('button', { name: 'Remove review' });
    this.removeTooltip = this.reviewCell.getByRole('tooltip', { name: 'Remove review' });
    this.regenerateButton = this.reviewCell.getByRole('button', { name: 'Regenerate review' });
    this.regenerateTooltip = this.reviewCell.getByRole('tooltip', { name: 'Regenerate review' });
    this.copyReviewComponent = new CopySectionComponent(this.reviewCell);
    this.copyLinkComponent = new CopyShareableLinkComponent(this.reviewCell);
    this.reviewPreviousResponse = this.reviewContainer.getByRole('button', { name: 'Previous version' });
    this.reviewNextResponse = this.reviewContainer.getByRole('button', { name: 'Next version' });
    this.toolkitReferencesLoad = this.reviewContainer.getByText('Retrieving references');
    this.toolkitReferencesSection = this.reviewContainer.locator('div:has-text("Related Toolkit references")').last();
    this.toolkitReferencesLinks = this.toolkitReferencesSection.getByRole('link');
  }
}
