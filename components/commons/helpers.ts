import { Locator, test } from '@playwright/test';
import * as fs from 'fs';
import { Page } from 'playwright-core';
import { faker } from '@faker-js/faker';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateTextOccurrences(textToValidate: string, keyword: string): number {
  const keywordRegex = new RegExp(escapeRegExp(keyword), 'gi');
  const matches = textToValidate.match(keywordRegex);
  return matches ? matches.length : 0;
}

export async function getElementSize(locator: Locator): Promise<{ width: number; height: number }> {
  return await locator.evaluate((element) => {
    if (element instanceof HTMLElement) {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    }
    return { width: 0, height: 0 }; // Return a default value if not an HTMLElement
  });
}

export async function createTestFile(filePath: string, content: string) {
  fs.writeFileSync(filePath, content);
}

export function createTestImageFile() {
  const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='; // red dot
  return {
    name: 'red-dot.png',
    mimeType: 'image/png',
    buffer: Buffer.from(imageData, 'base64'),
  };
}

export function createInvalidFile() {
  return {
    name: 'invalid-file',
    mimeType: '',
    buffer: Buffer.from('test', 'base64'),
  };
}

export function createLongPrompt() {
  const contextLimit = 100000;
  let longString = 'How do you read this number: ';
  for (let i = 0; i < contextLimit; i++) {
    longString += '1';
  }

  return longString;
}

/**
 * this function waits for an AI generation to complete. sets a long timeout since this can take a variable amount of time
 * uses the accessible role progressbar to wait for all loading to complete - https://www.w3.org/TR/wai-aria-1.1/#progressbar
 *
 * An optional `timeout` parameter allows customization of the maximum wait time,
 * which is useful for operations like video generation that may take longer than others.
 * The function will resolve as soon as the progress bar is hidden, even if the timeout has not been reached.
 *
 * @param page - The Playwright page or an object containing the page.
 * @param timeout - Optional max wait time in milliseconds. Defaults to 60 seconds.
 * @returns Resolves when the progress bar is hidden or times out.
 */

export async function waitForGenAi(page: Page | { readonly page: Page }, timeout: number = 60000) {
  test.slow(true, 'Any test that uses Gen AI will be slow!');
  if ('page' in page) {
    page = page.page;
  }

  await page.getByRole('progressbar').first().waitFor({ state: 'visible', timeout: 10000 });
  // first().hidden was the best way I could find to wait for no matching elements to be detected
  await page.getByRole('progressbar').first().waitFor({ state: 'hidden', timeout });
}

export async function fillRequiredField(field: Locator, value: string) {
  await field.click();
  await field.pressSequentially(value);
}

export async function generateMealPrompt(): Promise<string> {
  const product = faker.commerce.productName();
  const adjective = faker.word.adjective();
  const context = faker.helpers.arrayElement([
    'family dinner',
    'picnic',
    'holiday party',
    'kids lunchbox',
    'late-night snack',
    'midday meal',
    'TV binge night',
    'potluck event',
  ]);

  return `Enjoy a ${adjective} ${product} for your next ${context}`;
}
