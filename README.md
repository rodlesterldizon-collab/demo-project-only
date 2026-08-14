# 🤖 Generative AI Test Automation Framework

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=flat-square&logo=playwright&logoColor=white)
![Architecture](https://img.shields.io/badge/architecture-POM%20%2B%20Fixtures-blueviolet?style=flat-square)
![Status](https://img.shields.io/badge/status-Early--Stage%20Snapshot-orange?style=flat-square)

---

## 📖 Backstory & Project Context

This repository represents an early-stage snapshot of an end-to-end test automation framework originally designed for **Kraft Heinz** to validate their commercial **Generative AI platform**.

Representing approximately **4 months of initial QA & automation engineering work (January 2025 – April 2025)**, this codebase captures the transition from early manual testing and requirements analysis to scalable UI and functional test automation. During this initial 4-month build, the scope focused heavily on:

* **Text-Based LLM Testing:** Functional automation for prompt inputs, dynamic chat displays, text generation workflows, and multi-step prompt consoles.
* **RAG & CMS Validation:** Performing both manual and automated quality verification of Retrieval-Augmented Generation (RAG) outputs against underlying enterprise documents and CMS data repositories.
* **Core UI & E2E Automation:** Establishing a component-based Page Object Model (POM) and Playwright fixture architecture for broad front-end regression.

### 🚀 Platform Evolution Beyond This Snapshot
As the Kraft Heinz Generative AI initiative expanded, the production automation suite grew significantly larger and more sophisticated. Newer iterations of the framework (which ultimately became too massive and complex to sanitize for public repository sharing) introduced:

* **Multimodal Image & Video Validation:** Automated quality and accuracy checks for AI-generated visual and video media assets.
* **Enhanced RAG Data Reference Judging:** Automated verification evaluating how accurately LLMs retrieve and cite source documents and CMS records.
* **Semantic Input-Output Matching:** Advanced AI evaluation models that judge whether dynamic generated outputs accurately fulfill complex prompt instructions.

Because the full enterprise suite grew so large, this early-stage subset was selected and sanitized as a clean, manageable reference of the foundational framework architecture and core test suites. **Note that this snapshot is not a full reflection of the completed project**, but rather an early-stage representation of what was established during those initial 4 months.

> **🔒 Project Sanitization & Execution Note:**  
> This repository was specifically sanitized to remove all internal references, environment-specific URLs, API endpoints, and login wall access for the internal test environment originally hosted behind **Apply Digital's** secure infrastructure. All proprietary API keys, internal credentials, and backend authentication gateways have been stripped out so that this codebase can be safely reviewed outside of Apply Digital.
> 
> **⚠️ Note on Scope & Execution:** This repository is **not a full reflection of the completed project** or its final production state, nor will **these tests run out-of-the-box** without access to the sanitized internal backend endpoints. The actual test cases (`.spec.ts` files), page objects, fixtures, and components are preserved here purely as an archival repository of what was accomplished during the 4-month development period from **January 2025 to April 2025**.

---

## 🛠️ Framework Overview

Key technical capabilities and architectural highlights in this snapshot:

* **Modular POM Architecture:** Component-based Page Object Model cleanly separating pages, sub-sections, and reusable UI components.
* **Playwright Dependency Injection:** Custom fixture merging (`mergeTests`) to inject initialized page objects directly into test specs without setup boilerplate.
* **Solving GenAI Automation Challenges:** 
  * **Handling LLM Latency & Non-Determinism:** Custom synchronization ([`waitForGenAi()`](./components/commons/helpers.ts)) tracking WAI-ARIA `progressbar` role states instead of relying on arbitrary timeouts.
  * **LLM-as-a-Judge Evaluation:** Automated response quality validation using an AI evaluator to score answer relevance against confidence thresholds.
* **Advanced E2E Testing Techniques:** Browser context manipulation (JWT cookie injection to bypass onboarding), native API validation (Clipboard & File I/O), dynamic mock file creation (`@faker-js/faker`), multi-tab window handling, and HTTP 40x error state assertions.

---

## 🏗️ Architecture & Directory Map

The framework is structured using a multi-tiered **Page Object Model (POM)** pattern enhanced by Playwright's native dependency injection engine.

```text
kraft-heinz-project-sanitized-tests/
├── 📁 tests/                               # E2E Test Suites (*.spec.ts)
├── 📁 page-objects/                        # Page Object Model Layer
│   ├── 📁 pages/
│   │   ├── 📁 gen-ai/                     # Top-level Page Classes (e.g., base, home, self-serve)
│   │   └── 📁 sections/                   # Fragmented Form & Output Sub-Regions
│   └── 📁 components/                     # Reusable Global UI Widgets (e.g., nav, modal, combobox)
├── 📁 fixtures/                            # Playwright Custom Fixtures & Test Data
│   ├── 📁 pages/
│   │   ├── page-objects.fixture.ts         # Unified fixture runner combining all page objects
│   │   └── 📁 gen-ai/                     # Domain-specific page fixtures
│   └── 📁 test-data/                      # JSON schemas & mock payload data
├── 📁 components/commons/                  # Shared Helpers & Authentication Handlers
│   ├── helpers.ts                          # GenAI waits, file generators, locator utilities
│   └── IAPLogin.ts                         # Enterprise Google IAP Auth Handler with retry logic
└── 📁 configs/                             # Playwright Configuration files
    └── gen-ai-playwright.config.ts
```

---

## 🔬 Featured Code Highlights

### 1. LLM-as-a-Judge Relevance Scoring (`self-serve.spec.ts`)
Validating Generative AI outputs requires evaluating text quality dynamically. The snippet below demonstrates using a secondary LLM call to score the generated response relevance:

```typescript
test('[GEN-T80] Should Return Relevant Response To Prompt, Based On AI Relevance Evaluation', async ({
    selfservePage,
  }) => {
    // Given a user submits a prompt
    await selfservePage.chatOutputDisplaySection.kickoffButtons.nth(0).click();
    const promptText = await selfservePage.chatInputFormSection.promptInput.textContent();

    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const aiGeneratedResponse = await selfservePage.chatOutputDisplaySection.promptResponse.textContent();

    // Then evaluate relevance using an AI judge prompt
    const relevanceEvaluationPrompt = `Given you are a third-party QA context validator.
      Consider prompt: ${promptText} 
      And generated response: ${aiGeneratedResponse}`;
    
    const { text: relevanceScoreText } = await textChat({ prompt: relevanceEvaluationPrompt });
    const relevanceScore = parseFloat(relevanceScoreText.trim());
    
    // Assert relevance passes confidence score threshold
    expect(relevanceScore).toBeGreaterThan(70);
  });
```

### 2. Smart GenAI Synchronization (`helpers.ts`)
Handling variable response times in Generative AI without arbitrary `waitForTimeout()`:

```typescript
export async function waitForGenAi(page: Page | { readonly page: Page }, timeout: number = 60000) {
  test.slow(true, 'GenAI generation steps marked slow');
  if ('page' in page) {
    page = page.page;
  }
  // Wait for progressbar indicator to appear, then wait for hidden state
  await page.getByRole('progressbar').first().waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('progressbar').first().waitFor({ state: 'hidden', timeout });
}
```

---

## 🧪 Complete Test Suite Inventory (`/tests/`)

Below is the complete set of E2E test suites exposed in the [`/tests`](./tests/) directory. Each spec file targets a distinct functional domain of the Generative AI application:

| Spec File | Test Identifiers | Description & Technical Concepts Demonstrated |
| :--- | :--- | :--- |
| 📄 [concept-innovation.spec.ts](./tests/concept-innovation.spec.ts) | `GEN-T138`, `GEN-T386` | **Multi-Tab Orchestration & Clipboard API:** Cross-tab user journeys verifying session persistence across browser contexts, copy-to-clipboard native API (`navigator.clipboard`) verification, and multi-field innovation form validation. |
| 📄 [cultural-compass-monitoring.spec.ts](./tests/cultural-compass-monitoring.spec.ts) | `GEN-T365`, `GEN-T366` | **Real-Time Monitoring Metrics:** Validates status indicators, active background process health checks, and monitoring dashboard widget rendering. |
| 📄 [cultural-compass.spec.ts](./tests/cultural-compass.spec.ts) | `GEN-T370`, `GEN-T372` | **Session & Cookie Injection:** Injects JWT tokens directly into browser cookie contexts to bypass user onboarding screens, enabling fast test execution of cultural insights and review sub-sections. |
| 📄 [disclaimer.spec.ts](./tests/disclaimer.spec.ts) | `GEN-T240`, `GEN-T244` | **Legal & Terms of Use:** Structural assertion of legal copy, terms page navigation, asset rendering (`tasteMakerImg`), and multi-paragraph DOM verification. |
| 📄 [error-design.spec.ts](./tests/error-design.spec.ts) | `GEN-T326`, `GEN-T327`, `GEN-T328` | **Error State & Fallback Recovery:** Intercepts 40x HTTP errors, verifies standardized fallback UI components, and tests session recovery via "Go Home" CTA redirection. |
| 📄 [generate-content-image.spec.ts](./tests/generate-content-image.spec.ts) | `GEN-T300`, `GEN-T305` | **Image Generation & Editing:** Prompt parameterization for visual generation, image aspect ratio dropdown selection, edit modal state management, and asset rendering assertions. |
| 📄 [generate-content-video.spec.ts](./tests/generate-content-video.spec.ts) | `GEN-T310` | **Async Video Generation:** Extended execution timeouts for heavy video rendering pipelines, prompt validation, and player control state verification. |
| 📄 [home.spec.ts](./tests/home.spec.ts) | `GEN-T1`, `GEN-T2` | **Landing Page Navigation:** Main application entryway assertions, app card catalog rendering, brand header verification, and onboarding modal auto-triggers. |
| 📄 [localization.spec.ts](./tests/localization.spec.ts) | `GEN-T25`, `GEN-T28` | **File I/O & Download Interception:** Dynamic test file generation using `@faker-js/faker`, binary upload validation, target translation outputs, and Playwright download event stream interception. |
| 📄 [push-notifications.spec.ts](./tests/push-notifications.spec.ts) | `GEN-T180`, `GEN-T185` | **Push Notification Messaging:** Notification payload creation, title/body character limit boundary checks, and marketing push preview component rendering. |
| 📄 [segmentation.spec.ts](./tests/segmentation.spec.ts) | `GEN-T210` | **Audience Segmentation:** Parameterized user segment selectors, demographic form controls, and target audience data binding checks. |
| 📄 [self-serve.spec.ts](./tests/self-serve.spec.ts) | `GEN-T80` | **LLM-as-a-Judge Evaluation:** Prompt input submission, output streaming completion detection, and automated AI evaluation scoring of answer relevance against threshold criteria. |
| 📄 [side-navigation.spec.ts](./tests/side-navigation.spec.ts) | `GEN-T10`, `GEN-T12` | **Global Navigation Drawer:** Menu expansion/collapse state, active link visual highlighting, sub-menu routing, and responsive sidebar layout checks. |

---

## 🧩 Page Objects, Sections & Components (`/page-objects/`)

To prevent code duplication and keep test specs declarative, page logic is modularized into three distinct layers:

### 1. Domain Page Objects (`/page-objects/pages/gen-ai/`)
Container classes inheriting from [`base.page.ts`](./page-objects/pages/gen-ai/base.page.ts) that expose high-level user workflows:
* 📄 [base.page.ts](./page-objects/pages/gen-ai/base.page.ts) - Shared base class providing common `Page` contexts and global navigation helpers.
* 📄 [home.page.ts](./page-objects/pages/gen-ai/home.page.ts) - Orchestrates home route features and card selections.
* 📄 [self-serve.page.ts](./page-objects/pages/gen-ai/self-serve.page.ts) - Encapsulates AI chat interaction sections and output displays.
* 📄 [concept-innovation.page.ts](./page-objects/pages/gen-ai/concept-innovation.page.ts) - Manages multi-step innovation generation forms and result sets.
* 📄 [localization.page.ts](./page-objects/pages/gen-ai/localization.page.ts) - Handles file upload forms and translated text outputs.
* 📄 [cultural-compass.page.ts](./page-objects/pages/gen-ai/cultural-compass.page.ts) & [cultural-compass-monitoring.page.ts](./page-objects/pages/gen-ai/cultural-compass-monitoring.page.ts) - Cultural insight review and live monitoring screens.
* 📄 [generate-content-image.page.ts](./page-objects/pages/gen-ai/generate-content-image.page.ts) & [generate-content-image-edit.page.ts](./page-objects/pages/gen-ai/generate-content-image-edit.page.ts) - Visual content creation pages.
* 📄 [generate-content-video.page.ts](./page-objects/pages/gen-ai/generate-content-video.page.ts) - Video production workflow pages.
* 📄 [push-notifications.page.ts](./page-objects/pages/gen-ai/push-notifications.page.ts), [segmentation.page.ts](./page-objects/pages/gen-ai/segmentation.page.ts), [disclaimer.page.ts](./page-objects/pages/gen-ai/disclaimer.page.ts), [error-page.ts](./page-objects/pages/gen-ai/error-page.ts) - Targeted domain pages.

### 2. Form & Output Sub-Sections (`/page-objects/pages/sections/`)
Localized form regions and output panels composed inside parent pages:
* 📄 [concept-innovation-generate-form.section.ts](./page-objects/pages/sections/concept-innovation-generate-form.section.ts) & [concept-innovation-result-and-update-form.section.ts](./page-objects/pages/sections/concept-innovation-result-and-update-form.section.ts)
* 📄 [self-serve-chat-input.section.ts](./page-objects/pages/sections/self-serve-chat-input.section.ts) & [self-serve-display-output.section.ts](./page-objects/pages/sections/self-serve-display-output.section.ts)
* 📄 [prompt-console.ts](./page-objects/pages/sections/prompt-console.ts)
* 📄 [localization-generate-form.section.ts](./page-objects/pages/sections/localization-generate-form.section.ts) & [localization-result-and-update-form.section.ts](./page-objects/pages/sections/localization-result-and-update-form.section.ts)
* 📄 [cultural-compass-results.section.ts](./page-objects/pages/sections/cultural-compass-results.section.ts) & [cultural-compass-send-for-review.section.ts](./page-objects/pages/sections/cultural-compass-send-for-review.section.ts)
* 📄 [generate-content-image-form.section.ts](./page-objects/pages/sections/generate-content-image-form.section.ts) & [generate-content-image-results.section.ts](./page-objects/pages/sections/generate-content-image-results.section.ts)
* 📄 [generate-content-video-form.section.ts](./page-objects/pages/sections/generate-content-video-form.section.ts)
* 📄 [push-notifications-generate-form.section.ts](./page-objects/pages/sections/push-notifications-generate-form.section.ts) & [push-notifications-output-result.section.ts](./page-objects/pages/sections/push-notifications-output-result.section.ts)
* 📄 [app-cards.section.ts](./page-objects/pages/sections/app-cards.section.ts) & [segmentation-generate-form.section.ts](./page-objects/pages/sections/segmentation-generate-form.section.ts)

### 3. Reusable UI Components (`/page-objects/components/`)
Global widgets reused across multiple pages:
* 📄 [side-navigation.component.ts](./page-objects/components/side-navigation.component.ts) - Collapsible side drawer.
* 📄 [combobox.component.ts](./page-objects/components/combobox.component.ts) - Custom accessible select & dropdown controls.
* 📄 [onboarding-modal.component.ts](./page-objects/components/onboarding-modal.component.ts) - First-time user welcome popups.
* 📄 [message-feedback-actions.component.ts](./page-objects/components/message-feedback-actions.component.ts) - Thumbs up/down AI feedback controls.
* 📄 [copy-shareable-link.component.ts](./page-objects/components/copy-shareable-link.component.ts) & [copy-section.component.ts](./page-objects/components/copy-section.component.ts) - Share link copy controls.
* 📄 [loading-screen.component.ts](./page-objects/components/loading-screen.component.ts), [refresh-toast.component.ts](./page-objects/components/refresh-toast.component.ts), [restart-session-dialog.component.ts](./page-objects/components/restart-session-dialog.component.ts), [breadcrumb.path.component.ts](./page-objects/components/breadcrumb.path.component.ts), [downloadimage.component.ts](./page-objects/components/downloadimage.component.ts), [app-card.component.ts](./page-objects/components/app-card.component.ts), [cultural-compass-review.component.ts](./page-objects/components/cultural-compass-review.component.ts), [undo-deleted-review.component.ts](./page-objects/components/undo-deleted-review.component.ts), [feedback.component.ts](./page-objects/components/feedback.component.ts), [forward-to-selfserve.component.ts](./page-objects/components/forward-to-selfserve.component.ts).

---

## 🛠️ Fixtures & Dependency Injection (`/fixtures/`)

Rather than instantiating page objects manually in every test file (`const home = new HomePage(page)`), this framework leverages Playwright's custom fixtures to inject initialized page objects directly into test signatures.

### Merged Fixture Pipeline (`mergeTests`)
The core orchestrator [`page-objects.fixture.ts`](./fixtures/pages/page-objects.fixture.ts) merges all domain-specific fixtures into a single `test` export:

```typescript
// fixtures/pages/page-objects.fixture.ts
import { mergeTests } from '@playwright/test';
import { test as genAiHomeTest } from './gen-ai/home-page.fixture';
import { test as genAiSelfServeTest } from './gen-ai/self-serve-page.fixture';
import { test as genAiConceptInnovationTest } from './gen-ai/concept-innovation-page.fixture';
// ... additional fixtures

export const test = mergeTests(
  genAiHomeTest,
  genAiSelfServeTest,
  genAiConceptInnovationTest,
  // ...
);
```

### Domain Fixture Files (`/fixtures/pages/gen-ai/`)
* 📄 [home-page.fixture.ts](./fixtures/pages/gen-ai/home-page.fixture.ts)
* 📄 [self-serve-page.fixture.ts](./fixtures/pages/gen-ai/self-serve-page.fixture.ts)
* 📄 [concept-innovation-page.fixture.ts](./fixtures/pages/gen-ai/concept-innovation-page.fixture.ts)
* 📄 [localization-page.fixture.ts](./fixtures/pages/gen-ai/localization-page.fixture.ts)
* 📄 [cultural-compass-page.fixture.ts](./fixtures/pages/gen-ai/cultural-compass-page.fixture.ts)
* 📄 [cultural-compass-monitoring-page.fixture.ts](./fixtures/pages/gen-ai/cultural-compass-monitoring-page.fixture.ts)
* 📄 [generate-content-image-page.fixture.ts](./fixtures/pages/gen-ai/generate-content-image-page.fixture.ts)
* 📄 [generate-content-video-page.fixture.ts](./fixtures/pages/gen-ai/generate-content-video-page.fixture.ts)
* 📄 [push-notifications-page.fixture.ts](./fixtures/pages/gen-ai/push-notifications-page.fixture.ts)
* 📄 [segmentation-page.fixture.ts](./fixtures/pages/gen-ai/segmentation-page.fixture.ts)
* 📄 [disclaimer-page.fixture.ts](./fixtures/pages/gen-ai/disclaimer-page.fixture.ts)
* 📄 [error-page.fixture.ts](./fixtures/pages/gen-ai/error-page.fixture.ts)

---

## ⚡ Shared Helpers & Infrastructure (`/components/commons/`)

* 📄 [helpers.ts](./components/commons/helpers.ts) - Key reusable utilities:
  * **`waitForGenAi(page, timeout)`**: Custom smart wait function that monitors WAI-ARIA `progressbar` roles to handle variable LLM generation response times cleanly without hardcoded sleeps.
  * **`createTestImageFile()`**: Generates in-memory base64 PNG image buffers (`red-dot.png`) for upload testing.
  * **`createInvalidFile()`**: Generates mock invalid binary files to test file-type rejection error handling.
  * **`createLongPrompt()`**: Constructs boundary test strings (100,000+ characters) to stress-test prompt token limits.
  * **`validateTextOccurrences(text, keyword)`**: Regex helper counting keyword frequencies in dynamic LLM outputs.
  * **`generateMealPrompt()`**: Employs `@faker-js/faker` to build realistic, randomized food product prompts.
* 📄 [IAPLogin.ts](./components/commons/IAPLogin.ts) - Automated authentication handler for Google Identity-Aware Proxy (IAP) with automated retry loop resiliency.

---

## ⚙️ Running Tests Locally

```bash
# Install dependencies
npm install

# Run full E2E regression suite (headless)
npm run e2e:regression-dev-all

# Launch Playwright Interactive UI Mode
npm run e2e:regression-dev-ui-tests
```

---

## 👨‍💻 Author

* **Rod Dizon** - Software Automation Engineer  
  📬 [dznr0013@humbermail.ca](mailto:dznr0013@humbermail.ca)