/**
 * Content box component for displaying main application content
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class ContentBox {
  private contentBox: blessed.Widgets.BoxElement;

  constructor(parent: blessed.Widgets.BoxElement) {
    this.contentBox = blessed.box({
      parent: parent,
      top: 3,
      bottom: 3,
      width: "100%",
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
      padding: 1,
      scrollable: true,
      alwaysScroll: true,
    });
  }

  public getBox(): blessed.Widgets.BoxElement {
    return this.contentBox;
  }

  public show(): void {
    this.contentBox.show();
  }

  public clearContent(): void {
    // Make a copy of children array to avoid modification during iteration
    const children = [...this.contentBox.children];
    children.forEach((child) => {
      if (child && typeof child.destroy === "function") {
        child.destroy();
      }
    });
    // Force screen update
    if (this.contentBox.screen) {
      this.contentBox.screen.render();
    }
  }
}
