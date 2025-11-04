import { Screen, HeaderBox, FooterBox, ContentBox } from "./ui";
import { WelcomeView, ProjectMetadataView, InformationView } from "./ui";
import { ApplicationState, ProjectService } from "./core";

export class Stackcraft {
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

  private async initScreen() {
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
    await this.updateContentBox();

    this.footerBox = new FooterBox(layout);
    this.footerBox.show();

    this.setupKeyHandling();
    this.screen.render();
  }

  private setupKeyHandling(): void {
    this.screen.getScreen().key(["s", "S"], async () => {
      if (this.appState.hasProjectLoaded()) {
        await this.startOver();
      }
    });

    this.screen.getScreen().key(["i", "I"], () => {
      this.showInformation();
    });
  }

  private async startOver(): Promise<void> {
    this.appState.clearProject();

    // Discover available files and set intelligent default
    const availableFiles = await this.projectService.discoverDefinitionFiles();
    const intelligentDefault =
      availableFiles.length > 0
        ? availableFiles[0] // Use first discovered file
        : "project-definition.json"; // Generic fallback

    this.appState.setDefinitionFileName(intelligentDefault);

    // Update footer to remove "Start Over" control and hide filename
    this.footerBox.updateContent("", false);

    // Reset header to default state
    const metadata = this.appState.getAppMetadata();
    this.headerBox.updateContent(
      metadata.title,
      metadata.subtitle,
      metadata.description
    );

    // Update content with proper sequencing
    await this.updateContentBox();
  }

  private showInformation(): void {
    InformationView.create(this.screen.getScreen(), () => {
      // Re-render the screen when information dialog is closed
      this.screen.render();
    });
  }

  private async updateContentBox(): Promise<void> {
    // Clear content before showing new view
    this.contentBox.clearContent();

    if (!this.appState.hasProjectLoaded()) {
      await this.showWelcomeScreen();
    } else {
      this.showProjectMetadata();
    }

    // Ensure proper rendering timing
    setImmediate(() => {
      this.screen.render();
    });
  }

  private async showWelcomeScreen(errorMessage?: string): Promise<void> {
    // Discover available definition files
    const availableFiles = await this.projectService.discoverDefinitionFiles();

    WelcomeView.create(
      this.contentBox.getBox(),
      this.appState.getDefinitionFileName(),
      {
        onLoadClick: (fileName: string) => this.loadProjectDefinition(fileName),
      },
      errorMessage,
      availableFiles
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

      // Update footer to show "Start Over" control
      this.footerBox.updateContent(this.appState.getDefinitionFileName(), true);

      // Update content box after footer update
      await this.updateContentBox();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.showWelcomeScreen(errorMessage);
    }
  }
}
