import { Locator, Page } from '@playwright/test';

export class PromptConsoleDrawerSection {
  readonly page: Page;
  readonly root: Locator;
  readonly promptConsoleCheckbox: Locator;
  readonly fullPrompt: Locator;
  readonly tabs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = this.page.locator('aside > div.relative');
    this.promptConsoleCheckbox = this.page.locator('aside > label');
    this.fullPrompt = this.page.locator('[role="tabpanel"]:has-text("Full Prompt:")');
    this.tabs = this.root.locator('[role="tab"]');
  }

  async collectPrompts(): Promise<string[]> {
    await this.fullPrompt.first().waitFor({ state: 'attached' });
    await this.promptConsoleCheckbox.click(); // Open the prompts console
    await this.root.waitFor({ state: 'visible' });
    // Find all the tabs within the prompts console
    const tabs = await this.tabs.elementHandles();
    const prompts = [];
    for (const tab of tabs) {
      await tab.click(); // Switch to the locale tab
      await this.fullPrompt.first().waitFor({ state: 'visible' });
      const promptText = await this.fullPrompt.first().textContent();
      if (promptText !== null) {
        prompts.push(promptText);
      } else {
        throw new Error('Prompt text is null for a tab');
      }
    }
    return prompts; // Contains prompts from all tabs
  }
}
