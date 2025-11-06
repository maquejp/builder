#!/usr/bin/env node

/**
 * Main CLI entry point for Stackcraft
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Welcome } from "./src/components";

async function main() {
  try {
    const welcome = new Welcome();
    welcome.display();
  } catch (error) {
    console.error("Failed to start Stackcraft:");
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
