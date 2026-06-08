### Generative AI Automation Framework ###

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=flat-square&logo=playwright&logoColor=white)
![CI Status](https://img.shields.io/badge/CI_Status-DEMO-orange?style=flat-square)

> **Note:** This repository serves as a **historical code exhibit** from **July 2025**, representing the initial phase of the automation journey. It is a data-cleansed, partial snapshot and **will not run**. All environment-specific connections (Staging/Dev), API tests, and proprietary integration modules have been removed or neutralized for demonstration purposes.

### Framework Overview

This directory contains E2E automated test samples built using Playwright. It highlights the architectural patterns and complex validation logic implemented during the project's inception.

## Technical Showcase
This framework demonstrates specialized engineering solutions for non-deterministic Gen-AI environments:
*   **AI-Powered Relevance Scoring:** Utilizes an "LLM-as-a-judge" pattern, employing a secondary AI model (e.g., Vertex AI/Gemini) to programmatically evaluate the quality and relevance of generated responses against defined thresholds.
*   **Stateful Session Management:** Validates complex application states, ensuring deep-linked URLs accurately restore previous AI generation threads, conversation history, and multi-step feedback loops.
*   **Robust Asynchronous Synchronization:** Implements a custom `waitForGenAi` utility to manage non-deterministic Gen-AI model latency, leveraging ARIA progress roles and network-idle states for reliable test synchronization.
*   **Cross-Context & Multi-Tab Orchestration:** Orchestrates complex user journeys across multiple browser contexts and tabs, verifying data persistence and asset forwarding between internal tools.
*   **Browser-Native API Integration Testing:** Validates system-level interactions, including `navigator.clipboard` for shareable links and automated file-system checks for dynamic downloads.
*   **Responsive & Accessibility Compliance:** Ensures comprehensive coverage for responsive design across various breakpoints (Desktop, Tablet, Mobile) and validates ARIA attributes for accessibility.
*   **Dynamic Test Data Generation:** Leverages `Faker.js` for high-entropy input generation and dynamic binary file creation to robustly test image upload pipelines and error handling.
*   **Scalable Architecture (POM & Playwright Fixtures):** Built on a scalable Page Object Model (POM) with a custom Playwright fixture system, ensuring high code reusability and clear separation of concerns.

## Page Object Model (POM) Architecture

This project leverages the **Page Object Model (POM)** design pattern to create a robust and maintainable automation suite. By abstracting the application's UI into distinct classes, we ensure that test scripts remain resilient to UI changes.

### Core Principles:
*   **Encapsulation:** All element locators and page-specific actions are contained within Page Object classes.
*   **Component-Based Design:** Shared UI elements like the `SideNavigationComponent` and `OnboardingModalComponent` are built as reusable components that can be integrated into multiple Page Objects.
*   **Fixture Integration:** We utilize Playwright's dependency injection (fixtures) to manage Page Object lifetimes. This eliminates the need for manual setup/teardown in every test file.

### Usage Example:
```typescript
import { test } from '@fixtures/pages/page-objects.fixture';

test('should interact with the page', async ({ selfservePage }) => {
  await selfservePage.goto();
  await selfservePage.chatInputFormSection.promptInput.fill('Hello AI');
});
```

### Requirements

Before running the tests, ensure the following steps are completed:

1. Clone the repository to your local machine.

2. Change your directory to the `automation-tests` folder where the test scripts and configuration files are located.

- `cd path/to/automation-tests`

3. Install the required modules by executing the following command in your terminal:

- `npm install`

4. Install Playwright browsers:

- `npx playwright install`

5. Refer to the `.env.example` file to create and populate a `.env` file with the necessary variables.

### Running the tests

When you are ready to run the tests:

1. Refer to the `package.json` file to view and choose a test script. For example, use the following script to run all tests:

- `npm run e2e:regression-dev-all` for headless execution or
- `npm run e2e:regression-dev-ui-tests` for UI console

2. After the tests are executed, the `allure-results` folder will be populated with report files. To generate an HTML report, run the following command in your terminal:

- `allure generate --single-file allure-results`

Open the `allure-report/index.html` file in a web browser to view the test report.

### Running the tests in Github Actions

When you are ready to run the tests:

1. Refer to `./.github` from project root folder to view the workflow. The following file locations were updated to handle the end-to-end tests:

- `actions/playwright/actions.yml` Runs playwright tests 
- `workflows/check.yaml` for the workflow that triggers the e2e tests
- `workflows/primary.yaml` add the check workflow (including e2e) to the primary workflow


2. After the tests are executed, the `allure-results` folder will be populated with report files. To generate an HTML report, run the following command in your terminal:

- `allure generate --single-file allure-results`

Open the `allure-report/index.html` file in a web browser to view the test report.

### Authors

- Rod Dizon [dznr0013@humbermail.ca]



Happy testing! 🚀# demo-project-only
