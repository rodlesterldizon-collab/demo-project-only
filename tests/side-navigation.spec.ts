import { test } from '@fixtures/pages/page-objects.fixture';
import { SideNavigationComponent } from '@pageObjects/components/side-navigation.component';
import { expect } from '@playwright/test';

test.describe(`Side Navigation Tests`, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.page.context().clearCookies(); // reset cookies from toggling side nav
    await homePage.goto();
  });

  test('[GEN-T197,GEN-T233] Desktop should have sidebar opened by default', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });

    // Given I have logged into the tool
    // When I view the side navigation
    await expect(homePage.sideNavigationComponent.container).toBeVisible();

    // Then the full side nav as well as the app menu will both be open by default.
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();
  });

  test('[GEN-T234] Laptop/Tablet should have sidebar collapsed by default', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 1024, height: 720 });

    // GIVEN: The user is accessing the application on a screen resolution equal to or above the desktop and above breakpoint.
    // WHEN: The application is loaded.
    await expect(homePage.sideNavigationComponent.container).toBeVisible();

    // THEN: The sidebar should be initially collapsed
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();
  });

  test('[GEN-T198] Should be able to collapse or minimize the sidebar nav', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });

    // Given the side navigation is open
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();

    // When I click the trigger button on the side navigation
    await homePage.sideNavigationComponent.trigger.click();

    // Then the side nav will collapse into “collapsed state”
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();

    // And will remain in collapsed state until explicitly opened.
    await page.reload();
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();

    await homePage.sideNavigationComponent.trigger.click();
    await expect(homePage.sideNavigationComponent.logo).toBeVisible({ timeout: 5000 });
  });

  test('[GEN-T199] Should be able to navigate the collapsed sidebar nav within 2 steps/clicks or less', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });

    const sideNavigationComponent = new SideNavigationComponent(page);

    // Given the side navigation is collapsed
    await sideNavigationComponent.trigger.click();
    await expect(sideNavigationComponent.logo).not.toBeVisible();

    // When I interact with the collapsed side nav
    // Then I won’t have to click more than 2 times to get where I want to go.
    const links = await sideNavigationComponent.links.all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href == null) throw new Error("link doesn't have HREF");
      const target = await link.getAttribute('target');

      // for external links check that the open in a new page
      if (target === '_blank') {
        const [newPage] = await Promise.all([page.context().waitForEvent('page'), link.click()]);

        await expect(newPage).toHaveURL(href);

        // navigation tests go top to bottom, and help-center is the last non-external link
        await expect(page).toHaveURL('/help-center');
      } else {
        await Promise.all([page.waitForURL((url) => url.pathname === href), link.click()]);
      }
    }

    // apps
    await sideNavigationComponent.appsButton.click();
    const apps = await sideNavigationComponent.appsCollapsibleLinks.all();
    for (const app of apps) {
      const href = await app.getAttribute('href');
      await app.click();
      await page.waitForURL(href || '');
      await sideNavigationComponent.appsButton.click();
    }
  });

  test('[GEN-T193] Should verify that the "Apps" navigation item acts as an accordion, showing and hiding its sub-links on click', async ({
    page,
    homePage,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });

    // Given I have logged into the tool
    // When I view the side navigation
    await expect(homePage.sideNavigationComponent.container).toBeVisible();

    await expect(homePage.sideNavigationComponent.appsContainer).toBeVisible();

    // Then I see the "Apps" item in a expanded state with a visual affordance to indicate it is collapsable
    await expect(homePage.sideNavigationComponent.appsButton).toHaveAttribute('aria-expanded', 'true');

    // When I click the “Apps” item
    await homePage.sideNavigationComponent.appsButton.click();

    // Then the sub-links are hidden, and the "Apps" item is in a collapsed state with the correct collapse affordance
    await expect(homePage.sideNavigationComponent.appsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(homePage.sideNavigationComponent.appsLinks).toHaveCount(0);

    // When I click the “Apps” item again
    await homePage.sideNavigationComponent.appsButton.click();

    // Then the sub-links are visible, and the "Apps" item is in an expanded state
    await expect(homePage.sideNavigationComponent.appsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(homePage.sideNavigationComponent.appsLinks).not.toHaveCount(0);
  });

  test('[GEN-T200] Should be able to open the tour modal via the sidebar link', async ({ homePage }) => {
    // Given I have logged into the tool
    // When I click on the Tastemaker Tool menu item in the side navigation
    await expect(homePage.sideNavigationComponent.tourOnboardingButton).toBeVisible();
    await homePage.sideNavigationComponent.tourOnboardingButton.click();
    // Then the tour modal will open
    await expect(homePage.onboardingModalComponent.container).toBeVisible();
  });

  test('[GEN-T235] [Desktop] Should expand on click the Sidebar with Collapsed-State', async ({ page, homePage }) => {
    // Given sidebar is collapsed
    await page.setViewportSize({ width: 1440, height: 1024 });
    await homePage.sideNavigationComponent.trigger.click();
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();

    // When clicking the sidebar rail
    await homePage.sideNavigationComponent.container.click();

    // Then the sidebar opens over top of the page content
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();

    // And then clicking out of the sidebar closes the sidebar
    await page.click('body', {
      position: { x: (page.viewportSize()?.width ?? 0) / 2, y: (page.viewportSize()?.height ?? 0) / 2 },
    });
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();
  });

  test('[GEN-T235] [Tablet/Laptop] Should expand on click the Sidebar with Collapsed-State', async ({
    page,
    homePage,
  }) => {
    // Given sidebar is collapsed
    await page.setViewportSize({ width: 1024, height: 720 });
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();

    // When clicking the sidebar rail
    await homePage.sideNavigationComponent.container.click();

    // Then the sidebar opens over top of the page content
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();

    // And then clicking out of the sidebar closes the sidebar
    await page.click('body', {
      position: { x: (page.viewportSize()?.width ?? 0) / 2, y: (page.viewportSize()?.height ?? 0) / 2 },
    });
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();
  });

  test('[GEN-T236] Should Adapt Sidebar on Resize-smaller', async ({ page, homePage }) => {
    // GIVEN: Sidenav is expanded
    await page.setViewportSize({ width: 1440, height: 1024 });
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();

    // WHEN: resize the browser
    // THEN: sidebar should collapse on a given breakpoint
    await page.setViewportSize({ width: 1024, height: 720 });
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();
  });

  test('[GEN-T237] Should Adapt Sidebar on Resize-larger', async ({ page, homePage }) => {
    // GIVEN: sidenav is collapsed
    await page.setViewportSize({ width: 1024, height: 720 });
    await expect(homePage.sideNavigationComponent.logo).not.toBeVisible();

    // WHEN: resize the browser
    // THEN: the sidenav automatically expands on a set breakpoint
    await page.setViewportSize({ width: 1440, height: 1024 });
    await expect(homePage.sideNavigationComponent.logo).toBeVisible();
  });
});
