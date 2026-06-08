import { test as base } from '@playwright/test';
import { SegmentationPage } from '../../../page-objects/pages/gen-ai/segmentation.page';

type GenAiSegmentationPageDefinitions = {
  segmentationPage: SegmentationPage;
};

export const test = base.extend<GenAiSegmentationPageDefinitions>({
  segmentationPage: async ({ page }, use) => {
    await use(new SegmentationPage(page));
  },
});
