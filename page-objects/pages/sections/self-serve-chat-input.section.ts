import { CopyShareableLinkComponent } from '@pageObjects/components/copy-shareable-link.component';
import { Locator, Page } from '@playwright/test';

export class ChatInputFormSection {
  readonly page: Page;
  readonly form: Locator;
  readonly promptInput: Locator;
  readonly submitPrompt: Locator;
  readonly multilineCheckbox: Locator;
  readonly addFileButton: Locator;
  readonly fileInput: Locator;
  readonly tmToolCheckbox: Locator;
  readonly promptText: Locator;
  readonly copyPageLinkComponent: CopyShareableLinkComponent;
  readonly newChat: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = this.page.locator('form');
    this.promptInput = this.form.getByLabel('Prompt Input');
    this.submitPrompt = this.form.getByLabel('Submit Prompt');
    this.multilineCheckbox = this.form.getByLabel('multiline');
    this.addFileButton = this.form.getByText('Add File');
    this.fileInput = this.addFileButton.locator('input[type=file]');
    this.tmToolCheckbox = this.form.getByLabel('Enable TM Tools');
    this.promptText = this.promptInput.locator('div');
    this.copyPageLinkComponent = new CopyShareableLinkComponent(page, 'Copy chat link');
    this.newChat = this.form.getByRole('button', { name: 'New Chat' });
  }
}
