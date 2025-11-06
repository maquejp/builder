/**
 * Database script generation result view
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";
import { ScriptGenerationResult } from "../../core/DatabaseScriptService";

export class DatabaseScriptResultView {
  public static create(
    screen: blessed.Widgets.Screen,
    result: ScriptGenerationResult,
    onClose: () => void
  ): void {
    // Create the main dialog box
    const dialog = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: "80%",
      height: "80%",
      label: result.success
        ? " Database Script Generation - Success "
        : " Database Script Generation - Error ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: result.success ? "#4a90e2" : "#e74c3c",
        },
        label: {
          fg: result.success ? "#4a90e2" : "#e74c3c",
        },
      },
      shadow: true,
    });

    // Create content area
    let content = "";

    if (result.success) {
      content = `✅ SUCCESS: ${result.message}\n\n`;

      if (result.filePath) {
        content += `📁 File saved to: ${result.filePath}\n\n`;
      }

      if (result.details) {
        content += `📊 Generation Details:\n`;
        content += `   • Tables processed: ${result.details.tablesProcessed}\n`;
        content += `   • Table names: ${result.details.tableNames.join(
          ", "
        )}\n`;
        content += `   • Script length: ${result.details.scriptLength.toLocaleString()} characters\n\n`;
      }

      content += `🎯 What was generated:\n`;
      content += `   • DROP statements for cleanup\n`;
      content += `   • CREATE TABLE statements with proper column definitions\n`;
      content += `   • ALTER TABLE statements for constraints\n`;
      content += `   • CREATE INDEX statements for performance\n`;
      content += `   • CREATE TRIGGER statements for audit columns\n`;
      content += `   • COMMENT statements for documentation\n\n`;

      content += `💡 Next steps:\n`;
      content += `   • Review the generated SQL script at the file location\n`;
      content += `   • Execute the script in your Oracle database\n`;
      content += `   • Test the table structure and constraints\n`;
      content += `   • Generate CRUD package if needed\n\n`;

      content += `Press ENTER to close this dialog`;
    } else {
      content = `❌ ERROR: ${result.message}\n\n`;

      if (result.error) {
        content += `🔍 Error Details:\n${result.error}\n\n`;
      }

      content += `💡 Troubleshooting:\n`;
      content += `   • Check your project definition file\n`;
      content += `   • Ensure database configuration is complete\n`;
      content += `   • Verify table and field definitions\n`;
      content += `   • Check for duplicate names or invalid references\n\n`;

      content += `Press ENTER to close this dialog`;
    }

    // Create scrollable text area for content
    const textArea = blessed.scrollabletext({
      parent: dialog,
      top: 1,
      left: 1,
      width: "100%-2",
      height: "100%-4",
      content: content,
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true,
      style: {
        fg: "#000000",
        bg: "#ffffff",
      },
    });

    // Create close button
    const closeButton = blessed.button({
      parent: dialog,
      bottom: 1,
      right: 2,
      width: 12,
      height: 1,
      content: "Close",
      style: {
        fg: "#ffffff",
        bg: result.success ? "#4a90e2" : "#e74c3c",
        focus: {
          bg: result.success ? "#357abd" : "#c0392b",
        },
      },
      mouse: true,
    });

    // Handle close button click
    closeButton.on("press", () => {
      dialog.destroy();
      onClose();
    });

    // Handle key events
    dialog.key(["enter", "escape"], () => {
      dialog.destroy();
      onClose();
    });

    // Focus the dialog
    dialog.focus();
    screen.render();
  }

  /**
   * Create a script preview dialog
   */
  public static createScriptPreview(
    screen: blessed.Widgets.Screen,
    scriptContent: string,
    details: {
      tablesProcessed: number;
      tableNames: string[];
      databaseType: string;
    },
    onClose: () => void,
    onGenerate?: () => void
  ): void {
    // Create the main dialog box
    const dialog = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: "90%",
      height: "90%",
      label: " Database Script Preview ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "#4a90e2",
        },
        label: {
          fg: "#4a90e2",
        },
      },
      shadow: true,
    });

    // Create header with details
    const header = blessed.text({
      parent: dialog,
      top: 1,
      left: 1,
      width: "100%-2",
      height: 3,
      content: `Database Type: ${details.databaseType} | Tables: ${
        details.tablesProcessed
      } (${details.tableNames.join(
        ", "
      )})\nScript Length: ${scriptContent.length.toLocaleString()} characters\n`,
      style: {
        fg: "#666666",
        bg: "#f8f9fa",
      },
    });

    // Create scrollable text area for script content
    const scriptArea = blessed.scrollabletext({
      parent: dialog,
      top: 4,
      left: 1,
      width: "100%-2",
      height: "100%-8",
      content: scriptContent,
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true,
      style: {
        fg: "#000000",
        bg: "#ffffff",
      },
      border: {
        type: "line",
      },
    });

    // Create button container
    const buttonContainer = blessed.box({
      parent: dialog,
      bottom: 1,
      left: 1,
      width: "100%-2",
      height: 3,
    });

    // Create generate button if callback provided
    if (onGenerate) {
      const generateButton = blessed.button({
        parent: buttonContainer,
        bottom: 0,
        left: 2,
        width: 16,
        height: 1,
        content: "Generate File",
        style: {
          fg: "#ffffff",
          bg: "#27ae60",
          focus: {
            bg: "#229954",
          },
        },
        mouse: true,
      });

      generateButton.on("press", () => {
        dialog.destroy();
        onGenerate();
      });
    }

    // Create close button
    const closeButton = blessed.button({
      parent: buttonContainer,
      bottom: 0,
      right: 2,
      width: 12,
      height: 1,
      content: "Close",
      style: {
        fg: "#ffffff",
        bg: "#95a5a6",
        focus: {
          bg: "#7f8c8d",
        },
      },
      mouse: true,
    });

    closeButton.on("press", () => {
      dialog.destroy();
      onClose();
    });

    // Handle key events
    dialog.key(["escape"], () => {
      dialog.destroy();
      onClose();
    });

    dialog.key(["enter"], () => {
      if (onGenerate) {
        dialog.destroy();
        onGenerate();
      }
    });

    // Focus the script area initially
    scriptArea.focus();
    screen.render();
  }
}
