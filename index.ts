#!/usr/bin/env node

/**
 * Main CLI entry point for Stackcraft
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Command } from "commander";
import { Welcome, Generator } from "./src/components";
import { readPackageInfo } from "./src/services";

async function main() {
  try {
    const packageInfo = readPackageInfo();
    const program = new Command();

    // Configure the CLI program
    program
      .name("stackcraft")
      .description(packageInfo.description)
      .version(packageInfo.version);

    // Default command - show welcome screen
    program.action(() => {
      const welcome = new Welcome();
      welcome.display();
    });

    // Generate command
    program
      .command("generate")
      .description("Generate project from configuration file")
      .action(async () => {
        const generator = new Generator();
        await generator.execute();
      });

    // Parse command line arguments
    await program.parseAsync(process.argv);
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
