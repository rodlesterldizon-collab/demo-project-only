# 🤖 Generative AI Automation Framework (Early-Stage Snapshot)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=flat-square&logo=playwright&logoColor=white)

**Project Status:** This repository contains a snapshot of an automation framework I developed during its early stages in July 2025. It serves as a practical demonstration of my approach to test automation using Playwright. 

*Note: To protect proprietary information, API keys, and internal environments, the core framework execution logic and credentials have been removed. What remains is a subset of the source code—specifically the test specifications (`.spec.ts` files)—provided to showcase my coding style, test design, and problem-solving approach.*

## 🛠️ Framework Overview

These test samples demonstrate how I tackle complex E2E scenarios, particularly for applications interacting with Generative AI. The tests are built on the Page Object Model (POM) pattern and utilize Playwright fixtures for test isolation.

## 🏗️ Project Structure (POM Architecture)

Even though the core implementations have been removed, the architecture of the framework follows a strict component-based Page Object Model to ensure high reusability and scalability:

```text
automation-tests/
├── components/                            # Reusable UI widgets shared globally across pages
│   ├── app-card.component.ts
│   └── copy-shareable-link.component.ts
├── pages/                                 # Orchestration layers and global route containers
│   └── gen-ai/                            # Domain-specific grouping for Generative AI views
│       ├── base.page.ts                   # Base page class with common methods/contexts
│       └── concept-innovation.page.ts
├── sections/                              # Fragmented form layouts and localized sub-regions
│   ├── concept-innovation-generate-form.section.ts
│   └── cultural-compass-results.section.ts
└── tests/                                 # Test implementations (*.spec.ts)
```

## 🔬 Technical Highlights & Testing Approaches

This subset of tests highlights several practical automation scenarios and how I handled them:

* **Cross-Tab & Multi-Context Testing:** Simulating user journeys that span across multiple browser tabs to verify that data correctly persists and passes between different parts of the application. (See `GEN-T138` in [concept-innovation.spec.ts](./tests/concept-innovation.spec.ts))
* **Testing Browser Native APIs:** Validating clipboard interactions (`navigator.clipboard`) to ensure shareable links and generated text copy correctly. (See `GEN-T386` in [concept-innovation.spec.ts](./tests/concept-innovation.spec.ts))
* **File System Operations:** Testing dynamic file uploads with randomized binary files (via `Faker.js`), and intercepting browser downloads to validate file types and dynamically generated filenames. (See `GEN-T25` in [localization.spec.ts](./tests/localization.spec.ts))
* **Session Manipulation:** Injecting JWTs directly into browser cookies to bypass mandatory user onboarding flows, allowing for faster and more isolated test execution. (See `GEN-T370` in [cultural-compass.spec.ts](./tests/cultural-compass.spec.ts))
* **Deep Linking & Browser History:** Using Playwright's `goBack()` and `goForward()` to verify that the application correctly caches and restores state, and testing that sessions rebuild properly from shared URLs. (See `GEN-T151` & `GEN-T130`)
* **Handling AI Latency:** Implementing custom synchronization methods (`waitForGenAi`) to handle the unpredictable load times typical of LLM applications, rather than relying on hardcoded timeouts.

## 💡 Usage Example: LLM-as-a-Judge

One of the unique challenges in this project was testing non-deterministic AI outputs. The test below demonstrates an "LLM-as-a-judge" pattern, where we use an AI to evaluate the relevance of the application's generated response against a specific threshold:

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

Since the core framework execution code has been stripped out, reviewers should focus on the `/tests` directory to review my test design and implementations:

* **Session & Cookie Manipulation:** [cultural-compass.spec.ts](./tests/cultural-compass.spec.ts)
* **Multi-Tab Orchestration & Clipboards:** [concept-innovation.spec.ts](./tests/concept-innovation.spec.ts)
* **File I/O and Downloads:** [localization.spec.ts](./tests/localization.spec.ts)
* **The LLM-as-a-judge implementation:** [self-serve.spec.ts](./tests/self-serve.spec.ts)

## 👨‍💻 Authors

* **Rod Dizon** - [dznr0013@humbermail.ca]