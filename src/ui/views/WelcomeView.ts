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
    // Clear any existing children safely
    const children = [...contentBox.children];
    children.forEach((child) => {
      if (child && typeof child.destroy === "function") {
        child.destroy();
      }
    });

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
      content: "Project definition file (click to edit, Enter to load):",
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
        bold: true,
      },
    });

    // Create a simple text display that shows current value
    let currentFileName = definitionFileName;

    const fileInput = blessed.box({
      parent: contentBox,
      top: 8,
      left: 2,
      width: "100%-4",
      height: 3,
      content: currentFileName,
      clickable: true,
      keys: true,
      input: true,
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

    // Handle key input manually
    fileInput.on("keypress", (ch: string, key: any) => {
      if (!key) return;

      if (key.name === "backspace") {
        currentFileName = currentFileName.slice(0, -1);
      } else if (key.name === "enter") {
        callbacks.onLoadClick(currentFileName);
        return;
      } else if (ch && ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126) {
        // printable ASCII characters only
        currentFileName += ch;
      }

      fileInput.setContent(currentFileName);
      if (contentBox.screen) {
        contentBox.screen.render();
      }
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
      callbacks.onLoadClick(currentFileName);
    });

    // Add click handler to focus the input
    fileInput.on("click", () => {
      fileInput.focus();
    });

    // Focus the input by default with proper timing
    setImmediate(() => {
      try {
        fileInput.focus();
        if (contentBox.screen) {
          contentBox.screen.render();
        }
      } catch (error) {
        // Input might have been destroyed, ignore the error
      }
    });
  }
}
