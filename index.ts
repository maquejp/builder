#!/usr/bin/env node

/**
 * Main CLI entry point for Stackcraft
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Command } from "commander";
import { Welcome, Generator } from "./src/components";
import { readPackageInfo } from "./src/services";
import chalk from "chalk";

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
      .option("-f, --file <path>", "Path to the project definition file")
      .action(async (options) => {
        const generator = new Generator();
        await generator.execute({ filePath: options.file });
      });

    // Parse command line arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red("❌ Failed to start Stackcraft:"));
    if (error instanceof Error) {
      console.error(chalk.red(`❌ ${error.message}`));
    } else {
      console.error(chalk.red("❌ Unknown error occurred"));
    }
    process.exit(1);
  }
}

// Run the application
main();
