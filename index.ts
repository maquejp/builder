/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Builder } from "./src/Builder";
import { ProjectConfigurationManager } from "./src/config";
import { FileBrowser } from "./src/ui";
import * as path from "path";

async function startBuilder(configPath: string) {
  try {
    // Initialize configuration manager
    const configManager = new ProjectConfigurationManager();

    // Load configuration from the selected JSON file
    await configManager.loadFromFile(configPath);

    // Get project metadata for the UI
    const projectMetadata = configManager.getProjectMetadata();

    // Create an instance and execute the default method
    const builder = new Builder({
      appTitle: `Builder v0.0.0 - ${projectMetadata.name}`,
      appSubTitle: "Welcome to the Project Builder!",
      appDescription: `Create amazing projects with ease - ${projectMetadata.description}`,
      menuOptions: [
        "Generate Full project",
        "Generate Database Scripts",
        "Generate Backend (API)",
        "Generate Frontend",
        "Generate Backend Tests",
      ],
      configManager: configManager,
    });

    builder.default();
  } catch (error) {
    console.error("Failed to start Builder application:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error occurred");
    }
    process.exit(1);
  }
}

async function main() {
  try {
    // Show file browser to select a JSON configuration file
    const fileBrowser = new FileBrowser({
      title: "Builder - Select Configuration File",
      startPath: __dirname,
      fileExtension: ".json",
      filePattern: "definition.json",
      excludedDirectories: [".git", "node_modules", "materials", "src", "dist"],
      onFileSelected: async (filePath: string) => {
        console.log(`\nSelected configuration file: ${filePath}\n`);
        await startBuilder(filePath);
      },
      onCancel: () => {
        console.log("\nOperation cancelled. Goodbye!");
        process.exit(0);
      },
    });

    fileBrowser.show();
  } catch (error) {
    console.error("Failed to start file browser:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error occurred");
    }
    process.exit(1);
  }
}

// Run the application
main();
