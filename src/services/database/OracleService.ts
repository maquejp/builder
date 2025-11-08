/**
 * Oracle Service for handling Oracle database specific operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import { DatabaseConfiguration, DatabaseTable } from "../../interfaces";
import { DatabaseHelper } from "./DatabaseHelper";
import { FileHelper } from "../../helpers";

export class OracleService {
  /**
   * Execute Oracle database operations
   * @param config Database configuration from project definition
   * @param projectFolder The project folder name from the project definition
   */
  public async execute(
    config: DatabaseConfiguration,
    projectFolder: string
  ): Promise<void> {
    console.log(
      chalk.blue("🔧 Oracle Service: Starting Oracle database operations...")
    );

    // Display tables information
    DatabaseHelper.showTables(config.tables);

    // Sort tables based on dependencies (referenced tables first)
    const sortedTables = DatabaseHelper.sortTablesByDependencies(config.tables);

    // Ensure the tables directory exists
    await FileHelper.ensureDatabaseDir(projectFolder, "tables");

    // Process each table
    for (let i = 0; i < sortedTables.length; i++) {
      const table = sortedTables[i];
      const tableScript = await this.createTable(table);

      // Save the table script to file using FileHelper with order number
      await FileHelper.saveDatabaseScript({
        projectFolder,
        scriptType: "tables",
        fileName: table.name,
        content: tableScript,
        order: i + 1, // Start from 1 instead of 0
      });

      await this.createConstrains(table);
      await this.populateTable(table);
      await this.createTrigger(table);
      await this.createView(table);
      await this.createCrudPackage(table);
    }

    console.log(
      chalk.green("✅ Oracle Service: Operations completed successfully")
    );
  }

  private async createTable(table: DatabaseTable): Promise<string> {
    console.log(chalk.blue(`🔧 Oracle Service: Creating table ${table.name}`));

    // Generate CREATE TABLE statement
    const tableName = table.name.toUpperCase();
    let script = `CREATE TABLE ${tableName} (\n`;

    // Process each field
    const fieldDefinitions = table.fields.map((field, index) => {
      const fieldName = field.name.toUpperCase();
      const fieldType = field.type.toUpperCase();

      // Build field definition
      let fieldDef = `    ${fieldName} ${fieldType}`;

      // Add nullable constraint (only for NOT NULL, as NULL is default in Oracle)
      if (field.nullable === false) {
        fieldDef += " NOT NULL";
      }

      // Add default value if specified
      if (field.default) {
        // Handle special Oracle keywords and string literals
        const defaultValue =
          field.default.toLowerCase() === "systimestamp"
            ? "SYSTIMESTAMP"
            : field.default.startsWith("'") && field.default.endsWith("'")
            ? field.default
            : `'${field.default}'`;
        fieldDef += ` DEFAULT ${defaultValue}`;
      }

      return fieldDef;
    });

    // Join field definitions
    script += fieldDefinitions.join(",\n");
    script += "\n);";

    // Add comments for table and fields
    const comments: string[] = [];

    // Add field comments
    table.fields.forEach((field) => {
      if (field.comment) {
        const fieldName = field.name.toUpperCase();
        comments.push(
          `COMMENT ON COLUMN ${tableName}.${fieldName} IS '${field.comment}';`
        );
      }
    });

    if (comments.length > 0) {
      script += "\n\n-- Field comments\n";
      script += comments.join("\n");
    }

    await this.delay(500);

    return script;
  }

  // TODO: Create relationships: foreign keys, unique constraints... (for each table)

  private async createConstrains(table: DatabaseTable): Promise<void> {
    console.log(
      chalk.blue(
        `🔧 Oracle Service: Creating relationships for table ${table.name}`
      )
    );
    // Placeholder for relationship creation logic
    await this.delay(500);
  }

  // TODO: Insert initial data (for each table)

  private async populateTable(table: DatabaseTable): Promise<void> {
    console.log(
      chalk.blue(
        `🔧 Oracle Service: Inserting initial data for table ${table.name}`
      )
    );
    // Placeholder for data population logic
    await this.delay(500);
  }

  // TODO: Create Triggers (for each table)

  private async createTrigger(table: DatabaseTable): Promise<void> {
    console.log(
      chalk.blue(`🔧 Oracle Service: Creating trigger for table ${table.name}`)
    );
    // Placeholder for trigger creation logic
    await this.delay(500);
  }

  // TODO: Create Views (for each table)

  private async createView(table: DatabaseTable): Promise<void> {
    console.log(
      chalk.blue(`🔧 Oracle Service: Creating view for table ${table.name}`)
    );
    // Placeholder for view creation logic
    await this.delay(500);
  }

  // TODO: Create CRUD Packages (for each table)

  private async createCrudPackage(table: DatabaseTable): Promise<void> {
    console.log(
      chalk.blue(
        `🔧 Oracle Service: Creating CRUD package for table ${table.name}`
      )
    );
    // Placeholder for CRUD package creation logic
    await this.delay(500);
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
