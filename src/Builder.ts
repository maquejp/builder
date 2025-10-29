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

    const headerBox = blessed.box({
      parent: layout,
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

    const contentBox = blessed.box({
      parent: layout,
      top: 3,
      bottom: 3,
      width: "100%",
      height: "100%",
      content: "Main content area",
      style: {
        fg: "white",
        bg: "black",
      },
    });

    const footerBox = blessed.box({
      parent: layout,
      bottom: 0,
      align: "center",
      valign: "middle",
      width: "100%",
      height: 3,
      content: "{center}{bold}Press 'q' or 'Esc' to quit.{/bold}{/center}",
      tags: true,
      style: {
        fg: "white",
        bg: "blue",
      },
    });

    // Render the screen.
    this.screen.render();
  }
}
