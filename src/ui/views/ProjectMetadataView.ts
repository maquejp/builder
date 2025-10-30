/**
 * Project metadata view component
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";
import { ProjectConfig } from "../../config";

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

    const metadataText =
      `Project Loaded Successfully!\n\n` +
      `Name: ${projectMetadata.name}\n` +
      `Version: ${projectMetadata.version}\n` +
      `Author: ${projectMetadata.author}\n` +
      `Description: ${projectMetadata.description}\n` +
      `License: ${projectMetadata.license}\n` +
      `Project Folder: ${projectMetadata.projectFolder}\n` +
      `\n- Stack:\n` +
      `  - Database: ${projectMetadata.stack?.database || "Not specified"}\n` +
      `  - Backend: ${
        projectMetadata.stack?.backend
          ? `${projectMetadata.stack.backend.type} (${
              projectMetadata.stack.backend.framework ||
              "No framework specified"
            })`
          : "Not specified"
      }\n` +
      `  - Frontend: ${
        projectMetadata.stack?.frontend
          ? `${projectMetadata.stack.frontend.type} (${
              projectMetadata.stack.frontend.framework ||
              "No framework specified"
            })`
          : "Not specified"
      }\n` +
      `Configuration Details:\n` +
      `- Database: ${
        projectMetadata.database ? "Configured" : "Not configured"
      }\n` +
      `- Backend: ${
        projectMetadata.backend ? "Configured" : "Not configured"
      }\n` +
      `- Frontend: ${
        projectMetadata.frontend ? "Configured" : "Not configured"
      }\n`;

    const metadataDisplay = blessed.text({
      parent: contentBox,
      top: 1,
      left: 2,
      width: "100%-4",
      height: "50%-2",
      content: metadataText,
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
        top: "30%",
        left: 2,
        width: "50%-2",
        height: "25%-1",
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
        top: "30%",
        left: "50%",
        width: "50%-2",
        height: "25%-1",
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
        const actionText = `Action: ${selectedAction}\n\nSelected: ${item.content}\n\nThis action will be implemented in a future update.`;
        actionDisplay.setContent(actionText);
        contentBox.screen.render();
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
}
