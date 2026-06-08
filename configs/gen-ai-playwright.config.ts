import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import '@/scripts/config';

const baseURL = process.env.baseUrl !== undefined ? process.env.baseUrl : 'https://PLUG_YOUR_URL_HERE/';

const config: PlaywrightTestConfig = {
  testDir: '../tests',
  // timeout: 60 * 1000,
  // expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1,
  // test-reports directory allows reports in Bitbucket Pipelines
  reporter: [
    ['list'],
    ['html', { outputFolder: '../playwright-report', open: 'on-failure' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['junit', { outputFile: '../../test-reports/playwright.xml' }],
  ],
  use: {
    actionTimeout: 0,
    locale: 'en-US',
    baseURL,
    trace: 'off',
    headless: process.env.DEBUG === 'true' ? false : true,
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          // default to a desktop viewport
          width: 1440,
          height: 1024,
        },
        video: 'off',
        channel: 'chromium',
        launchOptions: {
          // https://github.com/microsoft/playwright/issues/22944
          args: [`--unsafely-treat-insecure-origin-as-secure=${baseURL}`, `--headless=new`],
        },
      },
    },
  ],
};

export default config;
