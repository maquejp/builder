/**
 * Error view component for displaying error messages
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export interface ErrorViewCallbacks {
  onRetryClick: (fileName: string) => void;
}

export class ErrorView {
  public static create(
    contentBox: blessed.Widgets.BoxElement,
    screen: blessed.Widgets.Screen,
    definitionFileName: string,
    error: unknown,
    callbacks: ErrorViewCallbacks
  ): void {
    // Clear any existing children
    contentBox.children.forEach((child) => child.destroy());

    const errorText = blessed.text({
      parent: contentBox,
      top: 2,
      left: 2,
      width: "100%-4",
      height: 6,
      content:
        `Error loading project definition file!\n\n` +
        `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` +
        `Please check if the file exists and is valid JSON.`,
      style: {
        fg: "red",
        bg: "#8cc5f2",
      },
    });

    const fileLabel = blessed.text({
      parent: contentBox,
      top: 9,
      left: 2,
      width: "100%-4",
      height: 1,
      content: "Project definition file:",
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
        bold: true,
      },
    });

    const fileInput = blessed.textbox({
      parent: contentBox,
      top: 11,
      left: 2,
      width: "100%-4",
      height: 3,
      inputOnFocus: true,
      value: definitionFileName,
      style: {
        fg: "#000000",
        bg: "white",
        focus: {
          fg: "#000000",
          bg: "#ffff99",
        },
      },
      border: {
        type: "line",
      },
    });

    const retryButton = blessed.button({
      parent: contentBox,
      top: 15,
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

    retryButton.on("press", () => {
      const fileName = fileInput.getValue();
      callbacks.onRetryClick(fileName);
    });

    fileInput.focus();
    screen.render();
  }
}
