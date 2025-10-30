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

    const headerBox = this.getHeaderBox(layout);

    const contentBox = this.getContentBox(layout);
    contentBox.show();

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
      content: "Main content area - Welcome Box",
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
      padding: 1,
    });
  }
}
