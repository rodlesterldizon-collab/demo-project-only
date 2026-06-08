import { test } from '@fixtures/pages/page-objects.fixture';
import { expect } from '@playwright/test';
import { createTestImageFile } from '@components/commons/helpers';

export const videoSizeOptions = [
  { label: 'Widescreen', value: '16:9', className: 'aspect-[16/9]' },
  { label: 'Mobile', value: '9:16', className: 'aspect-[16/9] rotate-90' },
];

test.describe('Generate Content Video Page - Aspect Ratio Tests', () => {
  test.beforeEach(async ({ generateContentVideoPage }) => {
    await generateContentVideoPage.goto();
  });

  test('[GEN-T417 (1.0)] Should the User views aspect ratio selector for video', async ({
    generateContentVideoPage,
  }) => {
    const options = videoSizeOptions.map((video) => video.value);
    for (const option of options) {
      await expect(generateContentVideoPage.formSection.aspectRatioOption(option)).toBeVisible();
    }

    // Validate that 16:9 is selected by default
    await expect(generateContentVideoPage.formSection.aspectRatioOption('16:9')).toHaveAttribute(
      'data-state',
      'checked'
    );
  });

  test('[GEN-T418 (1.0)] Should the User selects aspect ratio selector for video', async ({
    generateContentVideoPage,
  }) => {
    // Click 9:16
    const portraitOption = generateContentVideoPage.formSection.aspectRatioOption('9:16');
    await portraitOption.click();

    // Check that 9:16 is selected and 16:9 is not
    await expect(portraitOption).toHaveAttribute('data-state', 'checked');
    await expect(generateContentVideoPage.formSection.aspectRatioOption('16:9')).not.toHaveAttribute(
      'data-state',
      'checked'
    );
  });

  test('[GEN-T395, GEN-T396)] Should be able to delete the image by pressing [X]', async ({
    generateContentVideoPage,
  }) => {
    const { formSection } = generateContentVideoPage;
    const imageFile = createTestImageFile();

    // GEN-T395  - Given the user has an image to reference for video generation
    // GEN-T395 - When they click to browse and select an image
    await formSection.imageUploadInput.setInputFiles({
      name: imageFile.name,
      mimeType: imageFile.mimeType,
      buffer: imageFile.buffer,
    });

    // GEN-T395 - Then the image will appear as a thumbnail in place of the drag and drop area
    await expect(formSection.imageThumbnail).toBeVisible();

    // GEN-T395 - And the image will have an x in the top right corner
    // GEN-T396 When they click the x on the image thumbnail
    await formSection.imageDeleteButton.click();

    // GEN-T396 Then the image will disappear and the drag and drop area will return to its original state.
    await expect(formSection.imageUploadArea).toBeVisible();
    await expect(formSection.imageThumbnail).toBeHidden();
    await expect(formSection.imageRequiredError).toBeVisible();
  });
});
