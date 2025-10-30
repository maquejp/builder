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

  public getBox(): blessed.Widgets.BoxElement {
    return this.contentBox;
  }

  public show(): void {
    this.contentBox.show();
  }

  public clearContent(): void {
    this.contentBox.children.forEach((child) => child.destroy());
  }
}
