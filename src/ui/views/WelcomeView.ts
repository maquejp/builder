/**
 * Welcome screen view component
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";

export interface WelcomeViewCallbacks {
  onLoadClick: (fileName: string) => void;
}

export class WelcomeView {
  public static create(
    contentBox: blessed.Widgets.BoxElement,
    definitionFileName: string,
    callbacks: WelcomeViewCallbacks,
    errorMessage?: string
  ): void {
    // Clear any existing children
    contentBox.children.forEach((child) => child.destroy());

    const welcomeText = blessed.text({
      parent: contentBox,
      top: 2,
      left: 2,
      width: "100%-4",
      height: 3,
      content: `Welcome to Builder!\n\nNo project definition file loaded.`,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    const fileLabel = blessed.text({
      parent: contentBox,
      top: 6,
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
      top: 8,
      left: 2,
      width: "100%-4",
      height: 3,
      inputOnFocus: true,
      keys: true,
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

    // Error message text (only displayed if errorMessage is provided)
    let errorText: blessed.Widgets.TextElement | null = null;
    if (errorMessage) {
      errorText = blessed.text({
        parent: contentBox,
        top: 12,
        left: 2,
        width: "100%-4",
        height: 3,
        content: `Error: ${errorMessage}`,
        style: {
          fg: "red",
          bg: "#8cc5f2",
        },
      });
    }

    const loadButton = blessed.button({
      parent: contentBox,
      top: errorMessage ? 16 : 12,
      left: 2,
      height: 3,
      width: 25,
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

    loadButton.on("press", () => {
      const fileName = fileInput.getValue();
      callbacks.onLoadClick(fileName);
    });

    fileInput.on("submit", () => {
      const fileName = fileInput.getValue();
      callbacks.onLoadClick(fileName);
    });
  }
}
