/**
 * Project metadata view component
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";
import { ProjectConfig } from "../../config";
import { DatabaseScriptService } from "../../core/DatabaseScriptService";

export class ProjectMetadataView {
  public static create(
    contentBox: blessed.Widgets.BoxElement,
    projectMetadata: ProjectConfig
  ): void {
    // Clear any existing children safely
    const children = [...contentBox.children];
    children.forEach((child) => {
      if (child && typeof child.destroy === "function") {
        child.destroy();
      }
    });

    // First column - Basic project information
    const basicInfoText =
      `Name: ${projectMetadata.name}\n` +
      `Version: ${projectMetadata.version}\n` +
      `Author: ${projectMetadata.author}\n` +
      `Description: ${projectMetadata.description}\n` +
      `License: ${projectMetadata.license}\n` +
      `Project Folder: ${projectMetadata.projectFolder}\n`;

    const basicInfoDisplay = blessed.text({
      parent: contentBox,
      top: 1,
      left: 2,
      width: "50%-2",
      height: "25%-2",
      content: basicInfoText,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    // Second column - Stack and configuration information
    const stackInfoText =
      `Stack:\n\n` +
      `Database: ${projectMetadata.stack?.database || "Not specified"}\n` +
      `Backend: ${
        projectMetadata.stack?.backend
          ? `${projectMetadata.stack.backend.type} (${
              projectMetadata.stack.backend.framework ||
              "No framework specified"
            })`
          : "Not specified"
      }\n` +
      `Frontend: ${
        projectMetadata.stack?.frontend
          ? `${projectMetadata.stack.frontend.type} (${
              projectMetadata.stack.frontend.framework ||
              "No framework specified"
            })`
          : "Not specified"
      }\n\n` +
      `Configuration Details:\n\n` +
      `Database: ${
        projectMetadata.database ? "Configured" : "Not configured"
      }\n` +
      `Backend: ${
        projectMetadata.backend ? "Configured" : "Not configured"
      }\n` +
      `Frontend: ${
        projectMetadata.frontend ? "Configured" : "Not configured"
      }\n`;

    const stackInfoDisplay = blessed.text({
      parent: contentBox,
      top: 1,
      left: "50%",
      width: "50%-2",
      height: "25%-2",
      content: stackInfoText,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });

    // Create menu options based on configuration
    const menuOptions: string[] = [];
    const menuActions: string[] = [];

    if (projectMetadata.database) {
      menuOptions.push("Create database script");
      menuActions.push("create-database");
    }

    if (projectMetadata.backend) {
      menuOptions.push("Create backend");
      menuActions.push("create-backend");
    }

    if (projectMetadata.frontend) {
      menuOptions.push("Create frontend");
      menuActions.push("create-frontend");
    }

    if (
      projectMetadata.database &&
      projectMetadata.backend &&
      projectMetadata.frontend
    ) {
      menuOptions.push("Create all");
      menuActions.push("create-all");
    }

    // Only create menu if there are options available
    if (menuOptions.length > 0) {
      const menu = blessed.list({
        parent: contentBox,
        top: "20%",
        left: 2,
        width: "100%-4",
        height: "15%",
        label: " Actions ",
        items: menuOptions,
        keys: true,
        vi: true,
        mouse: true,
        scrollable: true,
        style: {
          selected: {
            bg: "#4a90e2",
            fg: "#ffffff",
          },
          item: {
            fg: "#000000",
            bg: "#ffffff",
          },
          border: {
            fg: "#4a90e2",
          },
        },
        border: {
          type: "line",
        },
      });

      // Create action display textbox
      const actionDisplay = blessed.text({
        parent: contentBox,
        top: "37%",
        left: 2,
        width: "100%-4",
        height: "35%",
        label: " Selected Action ",
        content: "Select an action from the menu",
        border: {
          type: "line",
        },
        style: {
          fg: "#000000",
          bg: "#ffffff",
          border: {
            fg: "#4a90e2",
          },
        },
      });

      // Handle menu selection
      menu.on("select", (item, index) => {
        const selectedAction = menuActions[index];
        this.handleActionSelection(
          selectedAction,
          projectMetadata,
          contentBox.screen,
          actionDisplay
        );
      });

      menu.focus();
    } else {
      // Show message if no actions are available
      const noActionsMessage = blessed.text({
        parent: contentBox,
        top: "50%",
        left: 2,
        width: "100%-4",
        height: "50%-2",
        content:
          "No actions available. Please configure database, backend, or frontend in your project configuration.",
        style: {
          fg: "#666666",
          bg: "#ffffff",
        },
        border: {
          type: "line",
        },
      });
    }
  }

  /**
   * Handle action selection from the menu
   */
  private static handleActionSelection(
    action: string,
    projectMetadata: ProjectConfig,
    screen: blessed.Widgets.Screen,
    actionDisplay: blessed.Widgets.TextElement
  ): void {
    switch (action) {
      case "create-database":
        this.handleDatabaseScriptGeneration(
          projectMetadata,
          screen,
          actionDisplay
        ).catch((error) => {
          actionDisplay.setContent(`❌ Unexpected error:\n\n${error.message}`);
          screen.render();
        });
        break;

      case "create-backend":
        actionDisplay.setContent(
          "Backend generation is not yet implemented.\n\nThis feature will be available in a future update."
        );
        screen.render();
        break;

      case "create-frontend":
        actionDisplay.setContent(
          "Frontend generation is not yet implemented.\n\nThis feature will be available in a future update."
        );
        screen.render();
        break;

      case "create-all":
        actionDisplay.setContent(
          "Full stack generation is not yet implemented.\n\nThis feature will be available in a future update."
        );
        screen.render();
        break;

      default:
        actionDisplay.setContent(`Unknown action: ${action}`);
        screen.render();
        break;
    }
  }

  /**
   * Handle database script generation
   */
  private static async handleDatabaseScriptGeneration(
    projectMetadata: ProjectConfig,
    screen: blessed.Widgets.Screen,
    actionDisplay: blessed.Widgets.TextElement
  ): Promise<void> {
    // Update action display to show processing
    actionDisplay.setContent(
      "🔄 Processing database script generation...\n\nValidating configuration..."
    );
    screen.render();

    // Validate project for script generation
    const validation =
      DatabaseScriptService.validateProjectForScriptGeneration(projectMetadata);

    if (!validation.isValid) {
      actionDisplay.setContent(
        `❌ Validation failed:\n\n${validation.errors[0]}\n\n${
          validation.errors.length > 1
            ? `(+${validation.errors.length - 1} more issues)`
            : ""
        }\n\nPlease fix these issues and try again.`
      );
      screen.render();
      return;
    }

    if (validation.warnings.length > 0) {
      actionDisplay.setContent(
        `⚠️  Warning: ${validation.warnings[0]}\n\nContinuing with generation...`
      );
      screen.render();

      // Brief pause to show warnings
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    actionDisplay.setContent(
      "🔄 Generating database script file...\n\nCreating SQL script..."
    );
    screen.render();

    // Generate and save the script file directly
    try {
      const result = await DatabaseScriptService.generateScripts(
        projectMetadata
      );

      // Display result in the action display area
      if (result.success) {
        let content = `✅ SUCCESS: Database script generated!\n\n`;

        if (result.details) {
          content += `📊 ${result.details.tablesProcessed} tables processed:\n`;
          content += `${result.details.tableNames.join(", ")}\n\n`;
        }

        if (result.filePath) {
          // Show just the relative path for readability
          const relativePath = result.filePath.replace(process.cwd() + "/", "");
          content += `📁 Script saved to:\n${relativePath}\n\n`;
        }

        content += `💡 Complete Oracle SQL script ready!\n`;
        content += `Execute the script in your database to create the tables.`;

        actionDisplay.setContent(content);
      } else {
        let content = `❌ ERROR: ${result.message}\n\n`;

        if (result.error) {
          // Show only the first line of error details to keep it concise
          const errorLine = result.error.split("\n")[0];
          content += `� ${errorLine}\n\n`;
        }

        content += `💡 Check your project definition file\nand database configuration.`;

        actionDisplay.setContent(content);
      }

      screen.render();
    } catch (error) {
      actionDisplay.setContent(
        `❌ Unexpected error occurred:\n\n${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n💡 Please try again or check the console for more details.`
      );
      screen.render();
    }
  }
}
