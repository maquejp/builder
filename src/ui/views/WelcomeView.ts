/**
 * Welcome screen view component
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class WelcomeView {
  public static create(
    contentBox: blessed.Widgets.BoxElement,
    definitionFileName: string,
    onLoadClick: () => void
  ): void {
    // Clear any existing children
    contentBox.children.forEach((child) => child.destroy());

    const welcomeText = blessed.text({
      parent: contentBox,
      top: 2,
      left: 2,
      width: "100%-4",
      height: 5,
      content: `Welcome to Builder!\n\nNo project definition file loaded.\nPlease load the project definition file: ${definitionFileName}`,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    const loadButton = blessed.button({
      parent: contentBox,
      top: 8,
      left: 2,
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

    loadButton.on("press", onLoadClick);
    loadButton.focus();
  }
}
