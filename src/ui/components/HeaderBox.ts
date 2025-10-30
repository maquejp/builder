/**
 * Header component for displaying application title and metadata
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class HeaderBox {
  private headerBox: blessed.Widgets.BoxElement;

  constructor(
    parent: blessed.Widgets.BoxElement,
    title: string,
    subtitle: string,
    description: string
  ) {
    this.headerBox = blessed.box({
      parent: parent,
      top: 0,
      align: "center",
      valign: "middle",
      width: "100%",
      height: 3,
      content: `{center}{bold}${title}{/bold}\n${subtitle}\n${description}{/center}`,
      tags: true,
      style: {
        fg: "#efbc03",
        bg: "blue",
      },
    });
  }

  public getBox(): blessed.Widgets.BoxElement {
    return this.headerBox;
  }

  public updateContent(
    title: string,
    subtitle: string,
    description: string
  ): void {
    this.headerBox.setContent(
      `{center}{bold}${title}{/bold}\n${subtitle}\n${description}{/center}`
    );
  }

  public show(): void {
    this.headerBox.show();
  }
}
