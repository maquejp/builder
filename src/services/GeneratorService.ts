/**
 * Generator Service for handling project generation logic
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectDefinition } from "../interfaces";
import { ProjectDefinitionService } from "./ProjectDefinitionService";

export class GeneratorService {
  private projectDefinitionService: ProjectDefinitionService;

  constructor() {
    this.projectDefinitionService = new ProjectDefinitionService();
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

    // If the database node exists, simulate database setup
    if (
      projectDefinition.database &&
      projectDefinition.database.type !== "none"
    ) {
      console.log(`🔧 Setting up database...`);
      await this.delay(1000);
      console.log(`✅ Database setup completed.`);
    }

    // IF the backend node exists, simulate backend setup
    if (
      projectDefinition.backend &&
      projectDefinition.backend.type !== "none"
    ) {
      console.log(`🔧 Setting up backend...`);
      await this.delay(1000);
      console.log(`✅ Backend setup completed.`);
    }

    // IF the frontend node exists, simulate frontend setup
    if (
      projectDefinition.frontend &&
      projectDefinition.frontend.type !== "none"
    ) {
      console.log(`🔧 Setting up frontend...`);
      await this.delay(1000);
      console.log(`✅ Frontend setup completed.`);
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
