/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Builder } from "./src/Builder";
import { ProjectConfigurationManager } from "./src/config";
import * as path from "path";

async function main() {
  try {
    // Initialize configuration manager
    const configManager = new ProjectConfigurationManager();

    // Load configuration from the sample project JSON file
    const configPath = path.join(__dirname, "my-sample-project.json");
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

// Run the application
main();
