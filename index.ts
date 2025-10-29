/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectConfigurationManager } from "./src/config";
import { Builder } from "./src/Builder";

async function createScreen(configPath: string) {
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
    ],
    configManager: configManager,
  });
}

async function main() {
  try {
    await createScreen("./my-sample-project-definition.json");
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
