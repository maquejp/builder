/**
 * Database Service for handling database setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseConfiguration,
  TechnologyStack,
  ProjectMetadata,
  DomainContext,
} from "../../interfaces";
import { OracleService } from "./oracle";

export class DatabaseService {
  /**
   * Execute database setup
   * @param stack Database configuration from stack
   * @param config Database configuration from project definition
   * @param projectFolder The project folder name from the project definition
   * @param metadata Project metadata (author, license) for script generation
   * @param domainContext Domain context for realistic data generation
   */
  public async execute({
    stack,
    config,
    projectFolder,
    metadata,
    domainContext,
  }: {
    stack: TechnologyStack["database"];
    config?: DatabaseConfiguration;
    projectFolder: string;
    metadata?: ProjectMetadata;
    domainContext?: DomainContext;
  }): Promise<void> {
    console.log(`🔧 Setting up database...`);
    if (config) {
      switch (stack.type) {
        case "Oracle":
          console.log(`Using Oracle database ${stack.version}`);
          // Execute Oracle specific operations
          const oracleService = new OracleService();
          await oracleService.execute(
            config,
            projectFolder,
            metadata,
            domainContext
          );
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
