/**
 * Database Service for handling database setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseConfiguration, TechnologyStack } from "../../interfaces";
import { OracleService } from "./OracleService";

export class DatabaseService {
  /**
   * Execute database setup
   * @param stack Database configuration from stack
   * @param config Database configuration from project definition
   */
  public async execute({
    stack,
    config,
  }: {
    stack: TechnologyStack["database"];
    config?: DatabaseConfiguration;
  }): Promise<void> {
    console.log(`🔧 Setting up database...`);
    if (config) {
      switch (stack.type) {
        case "Oracle":
          console.log(`Using Oracle database ${stack.version}`);
          // Execute Oracle specific operations
          const oracleService = new OracleService();
          await oracleService.execute(config);
          break;
        default:
          throw new Error(`Unsupported database type: ${stack.type}`);
      }

      console.log(`✅ Database setup completed.`);
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
