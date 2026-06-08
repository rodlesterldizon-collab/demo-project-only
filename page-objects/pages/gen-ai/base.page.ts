import { OnboardingModalComponent } from '@pageObjects/components/onboarding-modal.component';
import { SideNavigationComponent } from '@pageObjects/components/side-navigation.component';
import { Locator, Page } from 'playwright-core';

export class genAiBasePage {
  readonly page: Page;
  readonly sideNavigationComponent: SideNavigationComponent;
  readonly onboardingModalComponent: OnboardingModalComponent;
  readonly onboardingModallearnMoreLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sideNavigationComponent = new SideNavigationComponent(page);
    this.onboardingModalComponent = new OnboardingModalComponent(page, 'Try TasteMaker Now');
    this.onboardingModallearnMoreLink = this.onboardingModalComponent.container.getByRole('link', {
      name: 'Learn More',
    });
  }
}
