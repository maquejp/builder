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
   * @param filePath Optional path to the project definition file
   */
  public async execute({ filePath }: { filePath?: string }): Promise<void> {
    try {
      // Display header only for generate command
      this.welcome.display(true);

      console.log(chalk.blue.bold("🚀 Stackcraft Generator"));

      if (filePath) {
        console.log(chalk.cyan(`📁 Using definition file: ${filePath}`));

        console.log(chalk.yellow("🔧 It's generating..."));

        await this.generatorService.generate({ filePath });

        console.log(chalk.green("✅ Generation completed successfully!"));
      } else {
        throw new Error("No definition file provided.");
      }
    } catch (error) {
      let errorMessage = "Generation failed:";
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      } else {
        errorMessage += " Unknown error occurred";
      }
      throw new Error(errorMessage);
    }
  }
}
