/**
 * Generator Service for handling project generation logic
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import boxen from "boxen";
import chalk from "chalk";
import { ProjectDefinition } from "../interfaces";
import { ProjectDefinitionService } from "./ProjectDefinitionService";
import { DatabaseService } from "./DatabaseService";
import { BackendService } from "./BackendService";
import { FrontendService } from "./FrontendService";

export class GeneratorService {
  private projectDefinitionService: ProjectDefinitionService;
  private databaseService: DatabaseService;
  private backendService: BackendService;
  private frontendService: FrontendService;

  constructor() {
    this.projectDefinitionService = new ProjectDefinitionService();
    this.databaseService = new DatabaseService();
    this.backendService = new BackendService();
    this.frontendService = new FrontendService();
  }

  /**
   * Generate project based on configuration
   * @param filePath Path to the project definition file (required)
   */
  public async generate({ filePath }: { filePath?: string }): Promise<void> {
    if (!filePath) {
      throw new Error("Project definition file path is required");
    }

    // Load and validate the project definition
    const projectDefinition =
      await this.projectDefinitionService.loadProjectDefinition({ filePath });

    console.log(
      `✅ Successfully loaded project definition: ${projectDefinition.name}`
    );

    // Display project information in a box
    this.displayProjectInfo(projectDefinition);

    // If the database node exists, setup database using DatabaseService
    if (
      projectDefinition.database &&
      projectDefinition.database.type !== "none"
    ) {
      await this.databaseService.execute({
        stack: projectDefinition.stack.database,
        config: projectDefinition.database,
      });
    }

    // IF the backend node exists, setup backend using BackendService
    if (
      projectDefinition.backend &&
      projectDefinition.backend.type !== "none"
    ) {
      await this.backendService.execute({
        stack: projectDefinition.stack.backend,
        config: projectDefinition.backend,
      });
    }

    // IF the frontend node exists, setup frontend using FrontendService
    if (
      projectDefinition.frontend &&
      projectDefinition.frontend.type !== "none"
    ) {
      await this.frontendService.execute({
        stack: projectDefinition.stack.frontend,
        config: projectDefinition.frontend,
      });
    }

    // Finalize generation
    console.log(
      `🎉 Project generation for ${projectDefinition.name} is complete!`
    );
  }

  /**
   * Display project information in a styled box
   * @param projectDefinition The project definition to display
   */
  private displayProjectInfo(projectDefinition: ProjectDefinition): void {
    const projectContent =
      chalk.bold.green(`📋 PROJECT CONFIGURATION\n\n`) +
      `${chalk.gray("Project:")} ${chalk.cyan(
        projectDefinition.name
      )} ${chalk.dim(`v${projectDefinition.version}`)}\n` +
      `${chalk.gray("Target:")}  ${chalk.blue(
        projectDefinition.projectFolder
      )}\n\n` +
      chalk.bold.yellow("STACK CONFIGURATION\n") +
      `${chalk.gray("💾 Database:")} ${chalk.magenta(
        projectDefinition.stack.database.type
      )} ${chalk.dim(`(${projectDefinition.stack.database.version})`)}\n` +
      `${chalk.gray("🔧 Backend:")}  ${chalk.magenta(
        projectDefinition.stack.backend.type
      )} ${chalk.dim(`(${projectDefinition.stack.backend.framework})`)}\n` +
      `${chalk.gray("🎨 Frontend:")} ${chalk.magenta(
        projectDefinition.stack.frontend.type
      )} ${chalk.dim(`(${projectDefinition.stack.frontend.framework})`)}`;

    const projectBox = boxen(projectContent, {
      padding: 1,
      margin: { left: 1, right: 1, top: 1, bottom: 1 },
      borderStyle: "single",
      borderColor: "green",
    });

    console.log(projectBox);
  }
}
