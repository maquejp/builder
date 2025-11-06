/**
 * Generator component for scaffolding projects
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import { GeneratorService } from "../services";
import { Welcome } from "./Welcome";

export class Generator {
  private generatorService: GeneratorService;
  private welcome: Welcome;

  constructor() {
    this.generatorService = new GeneratorService();
    this.welcome = new Welcome();
  }

  /**
   * Execute the generation process
   */
  public async execute(): Promise<void> {
    try {
      // Display header only for generate command
      this.welcome.display(true);

      console.log(chalk.blue.bold("🚀 Stackcraft Generator"));
      console.log(chalk.yellow("It's generating..."));

      await this.generatorService.generate();

      console.log(chalk.green("✅ Generation completed successfully!"));
    } catch (error) {
      console.error(chalk.red("❌ Generation failed:"));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      } else {
        console.error(chalk.red("Unknown error occurred"));
      }
      process.exit(1);
    }
  }
}
