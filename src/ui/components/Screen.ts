/**
 * Screen component for managing the main blessed screen
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class Screen {
  private screen: blessed.Widgets.Screen;

  constructor(title: string) {
    this.screen = blessed.screen({
      smartCSR: true,
      title: title,
      fullUnicode: true,
      width: "100%",
      height: "100%",
    });

    this.setupKeyHandlers();
  }

  private setupKeyHandlers(): void {
    // Quit on q or Control-C only (ESC is reserved for dialog closing)
    this.screen.key(["q", "C-c"], () => {
      return process.exit(0);
    });
  }

  public getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }

  public render(): void {
    this.screen.render();
  }

  public createMainLayout(): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: this.screen,
      width: "100%",
      height: "100%",
      style: {
        bg: "black",
      },
    });
  }
}
