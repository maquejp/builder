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
    errorMessage?: string,
    availableFiles?: string[]
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
      content: `Welcome to Stackcraft!\n\nNo project definition file loaded.`,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    // Error message text (only displayed if errorMessage is provided)
    let errorText: blessed.Widgets.TextElement | null = null;
    if (errorMessage) {
      errorText = blessed.text({
        parent: contentBox,
        top: 6,
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

    const startTop = errorMessage ? 10 : 6;
    let selectedFileName = definitionFileName;

    if (availableFiles && availableFiles.length > 0) {
      const fileLabel = blessed.text({
        parent: contentBox,
        top: startTop,
        left: 2,
        width: "100%-4",
        height: 1,
        content:
          "Select a project definition file (↑/↓ to navigate, Enter or click to load):",
        style: {
          fg: "#000000",
          bg: "#8cc5f2",
          bold: true,
        },
      });

      const fileList = blessed.list({
        parent: contentBox,
        top: startTop + 2,
        left: 2,
        width: "100%-4",
        height: Math.min(availableFiles.length + 2, 8), // Max height of 8
        items: availableFiles,
        keys: true,
        mouse: true,
        style: {
          fg: "#000000",
          bg: "white",
          selected: {
            fg: "white",
            bg: "blue",
          },
          focus: {
            border: {
              fg: "blue",
            },
          },
        },
        border: {
          type: "line",
        },
      });

      // Set initial selection to the current definition file if it exists in the list
      const currentIndex = availableFiles.indexOf(definitionFileName);
      if (currentIndex >= 0) {
        fileList.select(currentIndex);
      }

      fileList.on("select", (item) => {
        selectedFileName = item.getContent();
        callbacks.onLoadClick(selectedFileName);
      });

      // Focus the list by default with proper timing
      setImmediate(() => {
        try {
          fileList.focus();
          if (contentBox.screen) {
            contentBox.screen.render();
          }
        } catch (error) {
          // List might have been destroyed, ignore the error
        }
      });
    } else {
      // Fallback to manual input if no files are found
      const fileLabel = blessed.text({
        parent: contentBox,
        top: startTop,
        left: 2,
        width: "100%-4",
        height: 1,
        content:
          "No definition files found. Enter filename manually (Enter to load):",
        style: {
          fg: "#000000",
          bg: "#8cc5f2",
          bold: true,
        },
      });

      let currentFileName = definitionFileName;

      const fileInput = blessed.box({
        parent: contentBox,
        top: startTop + 2,
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

      const loadButton = blessed.button({
        parent: contentBox,
        top: startTop + 6,
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
}
