/**
 * Oracle Service for handling Oracle database specific operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import { DatabaseConfiguration } from "../../interfaces";
import { DatabaseHelper } from "./DatabaseHelper";

export class OracleService {
  /**
   * Execute Oracle database operations
   * @param config Database configuration from project definition
   */
  public async execute(config: DatabaseConfiguration): Promise<void> {
    console.log(
      chalk.blue("🔧 Oracle Service: Starting Oracle database operations...")
    );

    // Display tables information
    DatabaseHelper.showTables(config.tables);

    // Sort tables based on dependencies (referenced tables first)
    const sortedTables = this.sortTablesByDependencies(config.tables);

    // TODO: Create Tables (with fields, indexes, triggers and relationships)
    // NOTE: if a table is referenced by another, ensure the referenced table is created first
    // TODO: Insert initial data (for each table)
    // TODO: Create Views (for each table)
    // TODO: Create CRUD Packages (for each table)

    for (const table of sortedTables) {
      // Simulate some processing time per table
      console.log(
        chalk.blue(`🔧 Oracle Service: Processing table ${table.name}`)
      );
      for (const field of table.fields) {
        console.log(
          chalk.cyan(
            `🔧 Oracle Service: Processing field ${field.name} ${field.type}...`
          )
        );
      }

      await this.delay(300);
    }

    // Simulate some processing time
    await this.delay(500);

    console.log(
      chalk.green("✅ Oracle Service: Operations completed successfully")
    );
  }

  /**
   * Sort tables based on dependencies using topological sort
   * Tables that are referenced by others should be created first
   */
  private sortTablesByDependencies(
    tables: DatabaseConfiguration["tables"]
  ): DatabaseConfiguration["tables"] {
    const result: DatabaseConfiguration["tables"] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const tableMap = new Map(tables.map((table) => [table.name, table]));

    const visit = (tableName: string): void => {
      if (visited.has(tableName)) return;
      if (visiting.has(tableName)) {
        console.warn(
          chalk.yellow(
            `⚠️ Circular dependency detected involving table: ${tableName}`
          )
        );
        return;
      }

      visiting.add(tableName);
      const table = tableMap.get(tableName);

      if (table) {
        // Visit all tables that this table references (dependencies)
        if (table.referencingTo) {
          for (const referencedTable of table.referencingTo) {
            if (tableMap.has(referencedTable)) {
              visit(referencedTable);
            }
          }
        }

        visiting.delete(tableName);
        visited.add(tableName);
        result.push(table);
      }
    };

    // Visit all tables
    for (const table of tables) {
      visit(table.name);
    }

    console.log(
      chalk.blue(
        `🔧 Oracle Service: Tables sorted by dependencies: ${result
          .map((t) => t.name)
          .join(" → ")}`
      )
    );
    return result;
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
