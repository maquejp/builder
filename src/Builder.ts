import blessed from "blessed";
import { ProjectConfig, ProjectConfigurationManager } from "./config";

export class Builder {
  //   private configManager: ProjectConfigurationManager;
  private definitionFileName: string = "my-sample-project-definition.json";
  private projectMetadata: ProjectConfig | null = null;

  private menuOptions: string[] = [];

  private appTitle: string;
  private appSubTitle: string;
  private appDescription: string;

  private screen: blessed.Widgets.Screen = null!;
  private contentBox: blessed.Widgets.BoxElement = null!;
  private headerBox: blessed.Widgets.BoxElement = null!;
  private footerBox: blessed.Widgets.BoxElement = null!;

  constructor() {
    this.appTitle = 'Builder v0.0.0 - "Untitled Project"';
    this.appSubTitle = 'Version: "Unknown" | Author: "Unknown"';
    this.appDescription = "No description provided.";

    this.menuOptions = [
      "Generate Database Scripts",
      "Generate Backend (API)",
      "Generate Frontend",
      "Exit",
    ];

    this.initScreen();
  }

  private initScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: this.appTitle,
      fullUnicode: true,
      width: "100%",
      height: "100%",
    });

    // Quit on Escape, q, or Control-C.
    this.screen.key(["escape", "q", "C-c"], () => {
      return process.exit(0);
    });

    // Create the main layout.
    const layout = blessed.box({
      parent: this.screen,
      width: "100%",
      height: "100%",
      style: {
        bg: "black",
      },
    });

    this.headerBox = this.getHeaderBox(layout);
    this.headerBox.show();

    this.contentBox = this.getContentBox(layout);
    this.contentBox.show();
    this.updateContentBox();

    this.footerBox = this.getFooterBox(layout);
    this.footerBox.show();

    // Render the screen.
    this.screen.render();
  }

  private getHeaderBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      top: 0,
      align: "center",
      valign: "middle",
      width: "100%",
      height: 3,
      content: `{center}{bold}${this.appTitle}{/bold}\n${this.appSubTitle}\n${this.appDescription}{/center}`,
      tags: true,
      style: {
        fg: "#efbc03",
        bg: "blue",
      },
    });
  }

  private getFooterBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      bottom: 0,
      align: "center",
      valign: "middle",
      width: "100%",
      height: 3,
      content: "{center}{bold}Controls: Q/Esc=Quit{/bold}{/center}",
      tags: true,
      style: {
        fg: "#efbc03",
        bg: "blue",
      },
    });
  }

  private getContentBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      top: 3,
      bottom: 3,
      width: "100%",
      height: "100%",
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
      padding: 1,
      scrollable: true,
      alwaysScroll: true,
    });
  }

  private updateContentBox(): void {
    if (this.projectMetadata === null) {
      this.showWelcomeScreen();
    } else {
      this.showProjectMetadata();
    }
    this.screen.render();
  }

  private showWelcomeScreen(): void {
    // Clear any existing children
    this.contentBox.children.forEach((child) => child.destroy());

    const welcomeText = blessed.text({
      parent: this.contentBox,
      top: 2,
      left: 2,
      width: "100%-4",
      height: 5,
      content: `Welcome to Builder!\n\nNo project definition file loaded.\nPlease load the project definition file: ${this.definitionFileName}`,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    const loadButton = blessed.button({
      parent: this.contentBox,
      top: 8,
      left: 2,
      width: 30,
      height: 3,
      content: "Load Project Definition",
      align: "center",
      valign: "middle",
      style: {
        fg: "white",
        bg: "blue",
        focus: {
          fg: "white",
          bg: "green",
        },
      },
      mouse: true,
    });

    loadButton.on("press", () => {
      this.loadProjectDefinition();
    });

    loadButton.focus();
  }

  private showProjectMetadata(): void {
    if (!this.projectMetadata) return;

    // Clear any existing children
    this.contentBox.children.forEach((child) => child.destroy());

    const metadataText =
      `Project Loaded Successfully!\n\n` +
      `Name: ${this.projectMetadata.name}\n` +
      `Version: ${this.projectMetadata.version}\n` +
      `Author: ${this.projectMetadata.author}\n` +
      `Description: ${this.projectMetadata.description}\n` +
      `License: ${this.projectMetadata.license}\n` +
      `Project Folder: ${this.projectMetadata.projectFolder}\n\n` +
      `Configuration Details:\n` +
      `- Database: ${
        this.projectMetadata.database ? "Configured" : "Not configured"
      }\n` +
      `- Frontend: ${
        this.projectMetadata.frontend ? "Configured" : "Not configured"
      }\n` +
      `- Backend: ${
        this.projectMetadata.backend ? "Configured" : "Not configured"
      }\n` +
      `- Testing: ${
        this.projectMetadata.testing ? "Configured" : "Not configured"
      }`;

    const metadataDisplay = blessed.text({
      parent: this.contentBox,
      top: 1,
      left: 2,
      width: "100%-4",
      height: "100%-2",
      content: metadataText,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    // Update header information
    this.appTitle = `Builder v0.0.0 - "${this.projectMetadata.name}"`;
    this.appSubTitle = `Version: "${this.projectMetadata.version}" | Author: "${this.projectMetadata.author}"`;
    this.appDescription = this.projectMetadata.description;

    // Update header box content
    if (this.headerBox) {
      this.headerBox.setContent(
        `{center}{bold}${this.appTitle}{/bold}\n${this.appSubTitle}\n${this.appDescription}{/center}`
      );
    }
  }

  private async loadProjectDefinition(): Promise<void> {
    try {
      const configManager = new ProjectConfigurationManager();
      await configManager.loadFromFile(this.definitionFileName);
      this.projectMetadata = configManager.getProjectConfig();
      this.updateContentBox();
    } catch (error) {
      // Show error message
      this.contentBox.children.forEach((child) => child.destroy());

      const errorText = blessed.text({
        parent: this.contentBox,
        top: 2,
        left: 2,
        width: "100%-4",
        height: 8,
        content:
          `Error loading project definition file!\n\n` +
          `File: ${this.definitionFileName}\n` +
          `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }\n\n` +
          `Please check if the file exists and is valid JSON.`,
        style: {
          fg: "red",
          bg: "#8cc5f2",
        },
      });

      const retryButton = blessed.button({
        parent: this.contentBox,
        top: 11,
        left: 2,
        width: 20,
        height: 3,
        content: "Retry",
        align: "center",
        valign: "middle",
        style: {
          fg: "white",
          bg: "blue",
          focus: {
            fg: "white",
            bg: "green",
          },
        },
        mouse: true,
      });

      retryButton.on("press", () => {
        this.loadProjectDefinition();
      });

      retryButton.focus();
      this.screen.render();
    }
  }
}
