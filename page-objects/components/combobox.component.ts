import { Locator } from '@playwright/test';

/**
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */
export class Combobox {
  constructor(
    private base: Locator,
    private inputLocatorParams: (Parameters<(typeof base)['getByRole']> & ['combobox'])[1]
  ) {}

  public get input() {
    return this.base.getByRole('combobox', this.inputLocatorParams);
  }

  /**
   * To clear the combobox, make sure it's focused then press backspace once for every possible option.
   */
  public async clear() {
    await this.open();
    const numOptions = await (await this.options).count();
    for (let i = 0; i < numOptions; i++) await this.base.page().keyboard.press('Backspace');
  }

  public get listbox() {
    return this.input.getAttribute('aria-controls').then((id) => this.base.locator(`#${id}`));
  }

  public get options() {
    return this.listbox.then((listbox) => listbox.getByRole('option'));
  }

  public async getValues() {
    const locator = this.input.locator('..').locator('.group\\/value');
    const values = await locator.allTextContents();

    if (values.length === 0) return '';
    return values.length === 1 ? values[0].trim() : values;
  }

  public async selectRandomOption({ skipFirst = 0, skipLast = 0 } = {}) {
    await this.open();
    const numOptions = await (await this.options).count();
    const startIndex = skipFirst;
    const endIndex = numOptions - skipLast;
    const randomIndex = startIndex + Math.floor(Math.random() * (endIndex - startIndex));

    const option = (await this.options).nth(randomIndex);
    const text = await option.textContent();
    await option.click();
    return { text };
  }

  public async open() {
    if (!(await (await this.listbox).isVisible())) {
      await this.input.click();
    }
  }

  public async close() {
    await this.base.page().keyboard.press('Escape');
  }
}
