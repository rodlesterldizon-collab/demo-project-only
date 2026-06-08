import { Locator } from '@playwright/test';

export class CulturalCompassReview {
  readonly root: Locator;
  readonly reviewRecordInputTitle: Locator;
  readonly reviewRecordInputs: Locator;
  readonly reviewOutputTitle: Locator;
  readonly reviewOutputContent: Locator;
  readonly reviewOutputReferences: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.reviewRecordInputTitle = this.root.getByText('Inputs', { exact: true });
    this.reviewRecordInputs = this.root.getByLabel('Inputs').locator('> *');
    this.reviewOutputTitle = this.root.getByRole('button', { name: 'Output' });
    this.reviewOutputContent = this.reviewOutputTitle.locator('+ [data-state="open"]');
    this.reviewOutputReferences = this.reviewOutputContent.getByText('Related Toolkit references');
  }

  get reviewTimestamp(): Locator {
    const timestampRegex = /\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/i;
    return this.root.getByText(timestampRegex);
  }
}
