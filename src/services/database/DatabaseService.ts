/**
 * Database Service for handling database setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseConfiguration,
  TechnologyStack,
  ProjectDefinition,
} from "../../interfaces";
import { OracleService } from "./OracleService";

export class DatabaseService {
  /**
   * Execute database setup
   * @param stack Database configuration from stack
   * @param config Database configuration from project definition
   * @param projectFolder The project folder name from the project definition
   * @param projectDefinition The full project definition (optional for backward compatibility)
   */
  public async execute({
    stack,
    config,
    projectFolder,
    projectDefinition,
  }: {
    stack: TechnologyStack["database"];
    config?: DatabaseConfiguration;
    projectFolder: string;
    projectDefinition?: ProjectDefinition;
  }): Promise<void> {
    console.log(`🔧 Setting up database...`);
    if (config) {
      switch (stack.type) {
        case "Oracle":
          console.log(`Using Oracle database ${stack.version}`);
          // Execute Oracle specific operations
          const oracleService = new OracleService();
          await oracleService.execute(config, projectFolder, projectDefinition);
          break;
        default:
          throw new Error(`Unsupported database type: ${stack.type}`);
      }

      console.log(`✅ Database scripts creation completed.`);
    } else {
      throw new Error("No database configuration provided.");
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
