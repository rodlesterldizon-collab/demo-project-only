import { Page } from 'playwright-core';
import { genAiBasePage } from './base.page';
import { ConceptInnovationGenerateFormSection } from '../sections/concept-innovation-generate-form.section';
import { ConceptInnovationResultAndUpdateFormSection } from '../sections/concept-innovation-result-and-update-form.section';
import { PromptConsoleDrawerSection } from '../sections/prompt-console';
import { FeedbackComponent } from '@pageObjects/components/feedback.component';
import { CopySectionComponent } from '@pageObjects/components/copy-section.component';
import { CopyShareableLinkComponent } from '@pageObjects/components/copy-shareable-link.component';
import { ForwardToSelfServeComponent } from '@pageObjects/components/forward-to-selfserve.component';
import { LoadingScreenComponent } from '@pageObjects/components/loading-screen.component';
import { APPS_DETAILS } from '@/app/(default)/apps-mapping';
import { BreadcrumbPathComponent } from '@pageObjects/components/breadcrumb.path.component';

export class ConceptInnovationPage extends genAiBasePage {
  readonly generateFormSection: ConceptInnovationGenerateFormSection;
  readonly resultAndUpdateFormSection: ConceptInnovationResultAndUpdateFormSection;
  readonly promptConsoleSection: PromptConsoleDrawerSection;
  readonly feedbackComponent: FeedbackComponent;
  readonly copyPageLinkComponent: CopyShareableLinkComponent;
  readonly copySectionComponent: CopySectionComponent;
  readonly forwardToSelfServeComponent: ForwardToSelfServeComponent;
  readonly loadScreenComponent: LoadingScreenComponent;
  readonly breadcrumbComponent: BreadcrumbPathComponent;

  constructor(page: Page) {
    super(page);
    this.generateFormSection = new ConceptInnovationGenerateFormSection(page);
    this.resultAndUpdateFormSection = new ConceptInnovationResultAndUpdateFormSection(page);
    this.promptConsoleSection = new PromptConsoleDrawerSection(page);
    this.feedbackComponent = new FeedbackComponent(page);
    this.copyPageLinkComponent = new CopyShareableLinkComponent(page);
    this.copySectionComponent = new CopySectionComponent(page);
    this.forwardToSelfServeComponent = new ForwardToSelfServeComponent(page);
    this.loadScreenComponent = new LoadingScreenComponent(page);
    this.breadcrumbComponent = new BreadcrumbPathComponent(page);
  }

  async goto() {
    await this.page.goto(APPS_DETAILS.PRODUCT_CONCEPTS.url, { waitUntil: 'domcontentloaded' });
  }
}
