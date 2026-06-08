# 🤖 Generative AI Automation Framework

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=flat-square&logo=playwright&logoColor=white)
![CI Status](https://img.shields.io/badge/CI_Status-DEMO-orange?style=flat-square)

> **Note:** This repository serves as a **historical code exhibit** from **July 2025**, representing the initial phase of the automation journey. It is a data-cleansed, partial snapshot and **will not run**. All environment-specific connections (Staging/Dev), API tests, and proprietary integration modules have been removed or neutralized for demonstration purposes.

## 🛠️ Framework Overview

This directory contains E2E automated test samples built using Playwright. It highlights the hierarchical Page Object Model (POM) pattern and complex validation logic implemented in the framework.

## 🏗️ Project Structure

```text
automation-tests/
├── components/                            # Reusable UI widgets shared globally across pages
│   ├── app-card.component.ts
│   ├── breadcrumb.path.component.ts
│   ├── combobox.component.ts
│   ├── copy-section.component.ts
│   ├── copy-shareable-link.component.ts
│   └── ... (remaining core widgets)
├── pages/                                 # Orchestration layers and global route containers
│   └── gen-ai/                            # Domain-specific grouping for Generative AI views
│       ├── base.page.ts                   # Base page class with common methods/contexts
│       ├── concept-innovation.page.ts
│       ├── cultural-compass-monitoring.page.ts
│       ├── cultural-compass-page.ts
│       ├── disclaimer.page.ts
│       └── ... (remaining top-level pages)
├── sections/                              # Fragmented form layouts and localized sub-regions
│   ├── app-cards.section.ts
│   ├── concept-innovation-generate-form.section.ts
│   ├── concept-innovation-result-and-update.section.ts
│   ├── cultural-compass-results.section.ts
│   ├── cultural-compass-send-for-review.section.ts
│   └── ... (remaining compound UI sections)
└── tests/                                 # Test implementations (*.spec.ts)
```

## 🔬 Technical Showcase

This framework demonstrates specialized engineering solutions for non-deterministic Gen-AI environments:
* **AI-Powered Relevance Scoring:** Utilizes an "LLM-as-a-judge" pattern, employing a secondary AI model (e.g., Vertex AI/Gemini) to programmatically evaluate the quality and relevance of generated responses against defined thresholds.
* **Stateful Session Management:** Validates complex application states, ensuring deep-linked URLs accurately restore previous AI generation threads, conversation history, and multi-step feedback loops.
* **Robust Asynchronous Synchronization:** Implements a custom `waitForGenAi` utility to manage non-deterministic Gen-AI model latency, leveraging ARIA progress roles and network-idle states for reliable test synchronization.
* **Cross-Context & Multi-Tab Orchestration:** Orchestrates complex user journeys across multiple browser contexts and tabs, verifying data persistence and asset forwarding between internal tools.
* **Browser-Native API Integration Testing:** Validates system-level interactions, including `navigator.clipboard` for shareable links and automated file-system checks for dynamic downloads.
* **Responsive & Accessibility Compliance:** Ensures comprehensive coverage for responsive design across various breakpoints (Desktop, Tablet, Mobile) and validates ARIA attributes for accessibility.
* **Dynamic Test Data Generation:** Leverages `Faker.js` for high-entropy input generation and dynamic binary file creation to robustly test image upload pipelines and error handling.
* **Scalable Architecture (POM & Playwright Fixtures):** Built on a scalable Page Object Model (POM) with a custom Playwright fixture system, ensuring high code reusability and clear separation of concerns.

## 📐 Page Object Model (POM) Architecture

This project leverages the **Page Object Model (POM)** design pattern to create a robust and maintainable automation suite. By abstracting the application's UI into distinct classes, we ensure that test scripts remain resilient to UI changes.

### Core Principles:
* **Encapsulation:** All element locators and page-specific actions are contained within Page Object classes.
* **Component-Based Design:** Shared UI elements like the `SideNavigationComponent` and `OnboardingModalComponent` are built as reusable components that can be integrated into multiple Page Objects.
* **Fixture Integration:** We utilize Playwright's dependency injection (fixtures) to manage Page Object lifetimes. This eliminates the need for manual setup/teardown in every test file.

## 💡 Usage Example

```typescript
import { test } from '@fixtures/pages/page-objects.fixture';

test('should evaluate LLM response quality', async ({ selfservePage, aiJudge }) => {
  await selfservePage.goto();
  await selfservePage.chatInputFormSection.promptInput.fill('Explain quantum computing');
  
  // Custom sync for non-deterministic latency
  await selfservePage.waitForGenAiCompletion(); 
  
  // LLM-as-a-judge validation pattern
  const responseText = await selfservePage.resultsSection.getGeneratedText();
  await aiJudge.assertRelevanceScore(responseText, { threshold: 0.85 });
});
```

## 🧭 Codebase Navigation Guide

Because this is a non-runnable snapshot, please refer to the following directories to review the core architectural implementations:

* **The LLM-as-a-judge implementation:** Review the custom assertions inside `/tests/helpers` or the specific evaluation logic in `tests/`.
* **Stateful Session Management:** Check `pages/gen-ai/` to see how complex context logic is retained across navigation.
* **Custom Synchronization:** Review the base page classes (`base.page.ts`) to see the custom `waitForGenAi` DOM monitoring utilities.
* **Fixture Injections:** Look at how dependency injection is handled across the framework to keep tests perfectly isolated.

## 👨‍💻 Authors

* **Rod Dizon** - [dznr0013@humbermail.ca]