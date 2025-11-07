/**
 * Generator Service for handling project generation logic
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

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
  public async generate(filePath?: string): Promise<void> {
    if (!filePath) {
      throw new Error("Project definition file path is required");
    }

    // Load and validate the project definition
    const projectDefinition =
      await this.projectDefinitionService.loadProjectDefinition(filePath);

    console.log(
      `✅ Successfully loaded project definition: ${projectDefinition.name}`
    );

    // For now, just simulate some work
    await this.delay(1000);

    console.log(
      `📋 Project: ${projectDefinition.name} v${projectDefinition.version}`
    );
    console.log(`📁 Target folder: ${projectDefinition.projectFolder}`);
    console.log(
      `💾 Database type: ${projectDefinition.stack.database.type} (${projectDefinition.stack.database.version})`
    );
    console.log(
      `🔧 Backend: ${projectDefinition.stack.backend.type} (${projectDefinition.stack.backend.framework})`
    );
    console.log(
      `🎨 Frontend: ${projectDefinition.stack.frontend.type} (${projectDefinition.stack.frontend.framework})`
    );

    // If the database node exists, setup database using DatabaseService
    if (
      projectDefinition.database &&
      projectDefinition.database.type !== "none"
    ) {
      await this.databaseService.execute(
        projectDefinition.stack.database,
        projectDefinition.database
      );
    }

    // IF the backend node exists, setup backend using BackendService
    if (
      projectDefinition.backend &&
      projectDefinition.backend.type !== "none"
    ) {
      await this.backendService.execute(
        projectDefinition.stack.backend,
        projectDefinition.backend
      );
    }

    // IF the frontend node exists, setup frontend using FrontendService
    if (
      projectDefinition.frontend &&
      projectDefinition.frontend.type !== "none"
    ) {
      await this.frontendService.execute(
        projectDefinition.stack.frontend,
        projectDefinition.frontend
      );
    }

    // Finalize generation
    console.log(
      `🎉 Project generation for ${projectDefinition.name} is complete!`
    );
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
