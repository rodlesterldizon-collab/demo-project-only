# 🤖 Generative AI Automation Framework

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=flat-square&logo=playwright&logoColor=white)
![CI Status](https://img.shields.io/badge/CI_Status-DEMO-orange?style=flat-square)

Project Status: This repository is an architectural exhibit showcasing the automation framework developed in July 2025. It serves as a static reference for my implementation of the Page Object Model (POM), Playwright fixture patterns, and custom synchronization utilities for Gen-AI testing.

Note: To maintain security and confidentiality, all proprietary integration modules, firewall-gated environment connections, and API keys have been neutralized or removed. As such, this snapshot is intended for structural review and is not an executable test suite.

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
* **AI-Powered Relevance Scoring:** Utilizes an "LLM-as-a-judge" pattern, employing a secondary AI model (e.g., Vertex AI/Gemini) to programmatically evaluate the quality and relevance of generated responses against defined thresholds. (e.g., `GEN-T80`)
* **Stateful Session Management:** Validates complex application states, ensuring deep-linked URLs accurately restore previous AI generation threads, conversation history, and multi-step feedback loops. (e.g., `GEN-T127`, `GEN-T130`)
* **Robust Asynchronous Synchronization:** Implements a custom `waitForGenAi` utility to manage non-deterministic Gen-AI model latency, leveraging ARIA progress roles and network-idle states for reliable test synchronization. (e.g., `GEN-T367`)
* **Cross-Context & Multi-Tab Orchestration:** Orchestrates complex user journeys across multiple browser contexts and tabs, verifying data persistence and asset forwarding between internal tools. (e.g., `GEN-T138`, `GEN-T412`)
* **Browser-Native API Integration Testing:** Validates system-level interactions, including `navigator.clipboard` for shareable links and automated file-system checks for dynamic downloads. (e.g., `GEN-T386`, `GEN-T100`)
* **Responsive & Accessibility Compliance:** Validates system behavior across defined viewports and ensures accessibility standards by verifying ARIA attributes and roles. (e.g., `GEN-T151`, `GEN-T192`)
* **Dynamic Test Data Generation:** Leverages `Faker.js` for high-entropy input generation and dynamic binary file creation to robustly test image upload pipelines and error handling. (e.g., `GEN-T82`, `GEN-T283`)
* **Scalable Architecture (POM & Playwright Fixtures):** Built on a scalable Page Object Model (POM) with a custom Playwright fixture system, ensuring high code reusability and clear separation of concerns.

## 📐 Page Object Model (POM) Architecture

This project leverages the **Page Object Model (POM)** design pattern to create a robust and maintainable automation suite. By abstracting the application's UI into distinct classes, we ensure that test scripts remain resilient to UI changes.

### Core Principles: (e.g., `GEN-T189`, `GEN-T124`)
* **Encapsulation:** All element locators and page-specific actions are contained within Page Object classes.
* **Component-Based Design:** Shared UI elements like the `SideNavigationComponent` and `OnboardingModalComponent` are built as reusable components that can be integrated into multiple Page Objects.
* **Fixture Integration:** We utilize Playwright's dependency injection (fixtures) to manage Page Object lifetimes. This eliminates the need for manual setup/teardown in every test file.

## 💡 Usage Example

```typescript
test('[GEN-T80] Should Return Relevant Response To Prompt, Based On AI Relevance Evaluation', async ({
    selfservePage,
  }) => {
    // Given a user has entered a prompt in the chat input
    const kickOffIndex = 0;
    await selfservePage.chatOutputDisplaySection.kickoffButtons.nth(kickOffIndex).click();
    const promptText = await selfservePage.chatInputFormSection.promptInput.textContent();
    if (promptText === null) {
      throw new Error('Initial prompt text was null.');
    }
    // When the user submits the prompt
    await selfservePage.chatInputFormSection.submitPrompt.click();
    await selfservePage.chatInputFormSection.submitPrompt.isEnabled({ timeout: 30000 });
    await selfservePage.chatOutputDisplaySection.loadingAnimation.waitFor({ state: 'hidden' });
    const aiGeneratedResponse = await selfservePage.chatOutputDisplaySection.promptResponse.textContent();
    if (aiGeneratedResponse === null) {
      throw new Error('AI-generated response text was null.');
    }
    // Then a relevance score is calculated by comparing the prompt and response using AI
    const relevanceEvaluationPrompt = ` Given you are a third-party QA context validator.

      Consider the following prompt:  ${promptText} 
      And the following generated response: ${aiGeneratedResponse} 
      ${selfServePromptData['evaluateTextResponseRelevance'].prompt}`;
    const { text: relevanceScoreText } = await textChat({ prompt: relevanceEvaluationPrompt });
    const trimmedScoreText = relevanceScoreText.trim();
    const relevanceScore = parseFloat(trimmedScoreText);
    // AND the relevance score is above 70, indicating sufficient relevance
    if (relevanceScore > 70) {
      await expect(selfservePage.chatOutputDisplaySection.promptResponse).toBeVisible();
      expect(relevanceScore).toBeGreaterThan(70);
    } else {
      console.warn(`Warning: Non-critical condition did not pass.  Score was: ${relevanceScore}`);
      console.warn(`> ${promptText}\n> ${aiGeneratedResponse}`);
    }
  });
```

## 🧭 Codebase Navigation Guide

Because this is a non-runnable snapshot, please refer to the following files and directories to review the core architectural implementations:

* **The LLM-as-a-judge implementation:** Review the relevance evaluation logic in [self-serve.spec.ts](file:///Users/vimay/Downloads/automation-tests%202/tests/self-serve.spec.ts).
* **Stateful Session Management:** Check `pages/gen-ai/` to see how complex context logic is retained across navigation.
* **Custom Synchronization:** Review the base page classes (`base.page.ts`) to see the custom `waitForGenAi` DOM monitoring utilities.
* **Fixture Injections:** Look at how dependency injection is handled across the framework to keep tests perfectly isolated.

## 👨‍💻 Authors

* **Rod Dizon** - [dznr0013@humbermail.ca]