/**
 * Footer component for displaying controls and help information
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class FooterBox {
  private footerBox: blessed.Widgets.BoxElement;

  constructor(parent: blessed.Widgets.BoxElement) {
    this.footerBox = blessed.box({
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

  public getBox(): blessed.Widgets.BoxElement {
    return this.footerBox;
  }

  public show(): void {
    this.footerBox.show();
  }
}
