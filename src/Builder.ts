import { Screen, HeaderBox, FooterBox, ContentBox } from "./ui";
import { WelcomeView, ProjectMetadataView, ErrorView } from "./ui";
import { ApplicationState, ProjectService } from "./core";

export class Builder {
  private screen!: Screen;
  private headerBox!: HeaderBox;
  private footerBox!: FooterBox;
  private contentBox!: ContentBox;

  private appState: ApplicationState;
  private projectService: ProjectService;

  constructor() {
    this.appState = new ApplicationState();
    this.projectService = new ProjectService();

    this.initScreen();
  }

  private initScreen() {
    const metadata = this.appState.getAppMetadata();

    this.screen = new Screen(metadata.title);
    const layout = this.screen.createMainLayout();

    this.headerBox = new HeaderBox(
      layout,
      metadata.title,
      metadata.subtitle,
      metadata.description
    );
    this.headerBox.show();

    this.contentBox = new ContentBox(layout);
    this.contentBox.show();
    this.updateContentBox();

    this.footerBox = new FooterBox(layout);
    this.footerBox.show();

    this.setupKeyHandling();
    this.screen.render();
  }

  private setupKeyHandling(): void {
    this.screen.getScreen().key(["s", "S"], () => {
      if (this.appState.hasProjectLoaded()) {
        this.startOver();
      }
    });
  }

  private startOver(): void {
    this.appState.clearProject();

    // Reset filename to default
    this.appState.setDefinitionFileName("my-sample-project-definition.json");

    // Update footer to remove "Start Over" control and hide filename
    this.footerBox.updateContent("", false);

    // Reset header to default state
    const metadata = this.appState.getAppMetadata();
    this.headerBox.updateContent(
      metadata.title,
      metadata.subtitle,
      metadata.description
    );

    this.updateContentBox();
    this.screen.render();
  }

  private updateContentBox(): void {
    if (!this.appState.hasProjectLoaded()) {
      this.showWelcomeScreen();
    } else {
      this.showProjectMetadata();
    }
    this.screen.render();
  }

  private showWelcomeScreen(): void {
    WelcomeView.create(
      this.contentBox.getBox(),
      this.appState.getDefinitionFileName(),
      {
        onLoadClick: (fileName: string) => this.loadProjectDefinition(fileName),
      }
    );
  }

  private showProjectMetadata(): void {
    const projectMetadata = this.appState.getProjectMetadata();
    if (!projectMetadata) return;

    ProjectMetadataView.create(this.contentBox.getBox(), projectMetadata);

    // Update header information
    const metadata = this.appState.getAppMetadata();
    this.headerBox.updateContent(
      metadata.title,
      metadata.subtitle,
      metadata.description
    );
  }

  private async loadProjectDefinition(fileName?: string): Promise<void> {
    try {
      // Update the filename if provided
      if (fileName) {
        this.appState.setDefinitionFileName(fileName);
      }

      const projectMetadata = await this.projectService.loadProjectDefinition(
        this.appState.getDefinitionFileName()
      );
      this.appState.setProjectMetadata(projectMetadata);
      this.updateContentBox();

      // Update footer to show "Start Over" control
      this.footerBox.updateContent(this.appState.getDefinitionFileName(), true);

      // Ensure screen is rendered after footer update
      this.screen.render();
    } catch (error) {
      ErrorView.create(
        this.contentBox.getBox(),
        this.screen.getScreen(),
        this.appState.getDefinitionFileName(),
        error,
        {
          onRetryClick: (fileName: string) =>
            this.loadProjectDefinition(fileName),
        }
      );
    }
  }
}
