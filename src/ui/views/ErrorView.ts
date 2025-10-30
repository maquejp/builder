/**
 * Error view component for displaying error messages
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export class ErrorView {
  public static create(
    contentBox: blessed.Widgets.BoxElement,
    screen: blessed.Widgets.Screen,
    definitionFileName: string,
    error: unknown,
    onRetryClick: () => void
  ): void {
    // Clear any existing children
    contentBox.children.forEach((child) => child.destroy());

    const errorText = blessed.text({
      parent: contentBox,
      top: 2,
      left: 2,
      width: "100%-4",
      height: 8,
      content:
        `Error loading project definition file!\n\n` +
        `File: ${definitionFileName}\n` +
        `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` +
        `Please check if the file exists and is valid JSON.`,
      style: {
        fg: "red",
        bg: "#8cc5f2",
      },
    });

    const retryButton = blessed.button({
      parent: contentBox,
      top: 11,
      left: 2,
      width: 20,
      height: 3,
      content: "Retry",
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

    retryButton.on("press", onRetryClick);
    retryButton.focus();
    screen.render();
  }
}
