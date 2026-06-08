import { test as base } from '@playwright/test';
import { CulturalCompassMonitoringPage } from '@pageObjects/pages/gen-ai/cultural-compass-monitoring.page';

type CulturalCompassMonitoringPageDefinitions = {
  culturalCompassMonitoringPage: CulturalCompassMonitoringPage;
};

export const test = base.extend<CulturalCompassMonitoringPageDefinitions>({
  culturalCompassMonitoringPage: async ({ page }, Use) => {
    await Use(new CulturalCompassMonitoringPage(page));
  },
});
