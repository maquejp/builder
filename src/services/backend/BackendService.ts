/**
 * Backend Service for handling backend setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  BackendConfiguration,
  ProjectMetadata,
  TechnologyStack,
} from "../../interfaces";

export class BackendService {
  /**
   * Execute backend setup
   * @param stack Backend configuration from stack
   * @param backend Backend configuration from project definition
   * @param projectFolder The project folder name from the project definition
   * @param metadata Project metadata (author, license) for script generation
   */
  public async execute({
    stack,
    config,
    projectFolder,
    metadata,
  }: {
    stack: TechnologyStack["backend"];
    config?: BackendConfiguration;
    projectFolder: string;
    metadata?: ProjectMetadata;
  }): Promise<void> {
    console.log("\n\n");
    console.log(`🔧 Setting up backend...`);
    if (config) {
      console.log(`Project backend:`, config);
      await this.delay(1000);
      console.log(`✅ Backend setup completed.`);
    } else {
      throw new Error("No backend configuration provided.");
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
