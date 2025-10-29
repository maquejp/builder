import blessed from "blessed";
import { ProjectConfigurationManager } from "./config";

export class Builder {
  private configManager: ProjectConfigurationManager;
  private menuOptions: string[];
  private appTitle: string;
  private appSubTitle: string;
  private appDescription: string;
  private screen: blessed.Widgets.Screen = null!;
  constructor({
    appTitle,
    appSubTitle,
    appDescription,
    menuOptions,
    configManager,
  }: {
    appTitle: string;
    appSubTitle: string;
    appDescription: string;
    menuOptions: string[];
    configManager: ProjectConfigurationManager;
  }) {
    this.configManager = configManager;
    this.menuOptions = menuOptions;
    this.appTitle = appTitle;
    this.appSubTitle = appSubTitle;
    this.appDescription = appDescription;

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
