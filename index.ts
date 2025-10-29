/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Builder } from "./src/Builder";

async function createScreen() {
  // Create an instance and execute the default method
  const builder = new Builder();
}

async function main() {
  try {
    await createScreen();
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
