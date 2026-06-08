import { test as base } from '@playwright/test';
import { PushNotificationsPage } from '../../../page-objects/pages/gen-ai/push-notifications.page';

type GenAiPushNotificationsPageDefinitions = {
  pushNotificationsPage: PushNotificationsPage;
};

export const test = base.extend<GenAiPushNotificationsPageDefinitions>({
  pushNotificationsPage: async ({ page }, use) => {
    await use(new PushNotificationsPage(page));
  },
});
