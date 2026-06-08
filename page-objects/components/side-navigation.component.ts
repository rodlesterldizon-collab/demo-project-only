import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { Locator, Page } from '@playwright/test';

export class SideNavigationComponent {
  readonly container: Locator;
  readonly logo: Locator;
  readonly trigger: Locator;
  readonly links: Locator;
  readonly homeLink: Locator;
  readonly appsButton: Locator;
  readonly appsContainer: Locator;
  readonly appsLinks: Locator;
  readonly appsCollapsibleContainer: Locator;
  readonly appsCollapsibleLinks: Locator;
  readonly localizationLink: Locator;
  readonly conceptInnovationLink: Locator;
  readonly pushNotificationsLink: Locator;
  readonly selfServeLink: Locator;
  readonly helpCenterLink: Locator;
  readonly feedbackLink: Locator;
  readonly tourOnboardingButton: Locator;

  constructor(root: Page | Locator) {
    this.container = root.getByRole('navigation', { name: 'Primary Navigation' });
    this.logo = this.container.getByAltText('TasteMaker logo and word mark');
    this.trigger = this.container.getByRole('button', { name: 'Toggle Navigation' });
    this.links = this.container.getByRole('link');
    this.homeLink = this.container.getByRole('link', { name: 'Home' });
    this.appsButton = this.container.getByRole('button', { name: 'Apps' });
    this.appsContainer = this.container.getByRole('region', { name: 'Apps' });
    this.appsLinks = this.appsContainer.getByRole('link');
    this.appsCollapsibleContainer = root.getByRole('menu', { name: 'Apps' });
    this.appsCollapsibleLinks = this.appsCollapsibleContainer.getByRole('menuitem');
    this.localizationLink = this.container.getByRole('link', { name: APPS_DETAILS.LOCALIZATION.label });
    this.pushNotificationsLink = this.container.getByRole('link', { name: APPS_DETAILS.CRM.label });
    this.selfServeLink = this.container.getByRole('link', { name: APPS_DETAILS.SELF_SERVE.label });
    this.conceptInnovationLink = this.container.getByRole('link', { name: APPS_DETAILS.PRODUCT_CONCEPTS.label });
    this.helpCenterLink = this.container.getByRole('link', { name: 'Help Center' });
    this.feedbackLink = this.container.getByRole('link', { name: 'Provide Feedback' });
    this.tourOnboardingButton = this.container.getByRole('button', { name: 'TasteMaker Tour' });
  }
}
