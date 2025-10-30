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
    // Clear any existing children
    contentBox.children.forEach((child) => child.destroy());

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
      `- Frontend: ${
        projectMetadata.frontend ? "Configured" : "Not configured"
      }\n` +
      `- Backend: ${
        projectMetadata.backend ? "Configured" : "Not configured"
      }\n`;

    const metadataDisplay = blessed.text({
      parent: contentBox,
      top: 1,
      left: 2,
      width: "100%-4",
      height: "100%-2",
      content: metadataText,
      style: {
        fg: "#000000",
        bg: "#8cc5f2",
      },
    });
  }
}
