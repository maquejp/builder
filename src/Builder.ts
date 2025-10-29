import blessed from "blessed";
import { ProjectConfigurationManager } from "./config";

export class Builder {
  private fileName: string = "./my-sample-project-definition.json";
  private configManager: ProjectConfigurationManager;
  private menuOptions: string[];
  private appTitle: string;
  private appSubTitle: string;
  private appDescription: string;
  private screen: blessed.Widgets.Screen = null!;
  constructor() {
    this.configManager = new ProjectConfigurationManager();
    this.configManager.loadFromFile(this.fileName);

    // Get project metadata for the UI
    const projectMetadata = this.configManager.getProjectMetadata();

    this.appTitle = `Builder v0.0.0 - ${projectMetadata.name}`;
    this.appSubTitle = `Version: ${projectMetadata.version} | Author: ${projectMetadata.author}`;
    this.appDescription =
      projectMetadata.description || "No description provided.";

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

    const headerBox = this.getHeaderBox(layout);

    const welcomeBox = this.getWelcomeBox(layout);
    welcomeBox.show();

    const fileLoadBox = this.getFileLoadBox(layout);
    fileLoadBox.hide();

    const actionsBox = this.getActionsBox(layout);
    actionsBox.hide();

    // Add keyboard controls for toggling boxes
    this.screen.key(["w", "W"], () => {
      if (welcomeBox.visible) {
        welcomeBox.hide();
      } else {
        // Hide other boxes and show welcome box
        fileLoadBox.hide();
        actionsBox.hide();
        welcomeBox.show();
      }
      this.screen.render();
    });

    this.screen.key(["f", "F"], () => {
      if (fileLoadBox.visible) {
        fileLoadBox.hide();
      } else {
        // Hide other boxes and show file load box
        welcomeBox.hide();
        actionsBox.hide();
        fileLoadBox.show();
      }
      this.screen.render();
    });

    this.screen.key(["a", "A"], () => {
      if (actionsBox.visible) {
        actionsBox.hide();
      } else {
        // Hide other boxes and show actions box
        welcomeBox.hide();
        fileLoadBox.hide();
        actionsBox.show();
      }
      this.screen.render();
    });

    const footerBox = this.getFooterBox(layout);

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
        fg: "white",
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
      content:
        "{center}{bold}Controls: W=Welcome | F=File Load | A=Actions | Q/Esc=Quit{/bold}{/center}",
      tags: true,
      style: {
        fg: "white",
        bg: "blue",
      },
    });
  }

  private getWelcomeBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      top: 3,
      bottom: 3,
      width: "100%",
      height: "100%",
      content: "Main content area - Welcome Box (Press 'W' to toggle)",
      style: {
        fg: "white",
        bg: "black",
      },
    });
  }

  private getFileLoadBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      top: 3,
      bottom: 3,
      width: "100%",
      height: "100%",
      content: "File Loading Area (Press 'F' to toggle)",
      style: {
        fg: "white",
        bg: "black",
      },
    });
  }

  private getActionsBox(
    parent: blessed.Widgets.BoxElement
  ): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: parent,
      top: 3,
      bottom: 3,
      width: "100%",
      height: "100%",
      content: "Actions Area (Press 'A' to toggle)",
      style: {
        fg: "white",
        bg: "black",
      },
    });
  }
}
