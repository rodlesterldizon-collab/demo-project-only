import { mergeTests } from '@playwright/test';
import { test as genAiLocalizationTest } from './gen-ai/localization-page.fixture';
import { test as genAiConceptInnovationTest } from './gen-ai/concept-innovation-page.fixture';
import { test as genAiSelfServeTest } from './gen-ai/self-serve-page.fixture';
import { test as genAiSegmentationTest } from './gen-ai/segmentation-page.fixture';
import { test as genAiPushNotificationsTest } from './gen-ai/push-notifications-page.fixture';
import {
  test as genAiInclusiveMarketingTest,
  test as genAiCulturalCompass,
} from './gen-ai/cultural-compass-page.fixture';
import { test as genAiHomeTest } from './gen-ai/home-page.fixture';
import { test as genAiGenerateContentImageTest } from './gen-ai/generate-content-image-page.fixture';
import { test as genAiCulturalCompassMonitoringTest } from './gen-ai/cultural-compass-monitoring-page.fixture';
import { test as genAiGenerateContentVideoTest } from './gen-ai/generate-content-video-page.fixture';
import { test as genAiDisclaimer } from './gen-ai/disclaimer-page.fixture';

export const test = mergeTests(
  genAiHomeTest,
  genAiLocalizationTest,
  genAiSelfServeTest,
  genAiSegmentationTest,
  genAiPushNotificationsTest,
  genAiInclusiveMarketingTest,
  genAiGenerateContentImageTest,
  genAiCulturalCompassMonitoringTest,
  genAiCulturalCompass,
  genAiConceptInnovationTest,
  genAiGenerateContentVideoTest,
  genAiDisclaimer
);
