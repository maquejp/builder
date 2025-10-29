/**
 * DatabaseScriptGenerator - Action for generating database scripts
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BaseAction } from "../BaseAction";
import { BuilderUI } from "../../ui/BuilderUI";
import {
  ProjectConfigurationManager,
  DatabaseConfig,
  DatabaseTable,
} from "../../config";

/**
 * Database Script Generator Action
 * Handles the generation of database schema and migration scripts
 */
export class DatabaseScriptGenerator extends BaseAction {
  constructor(ui: BuilderUI, configManager: ProjectConfigurationManager) {
    super(ui, configManager);
  }

  /**
   * Execute the database script generation
   */
  public execute(): void {
    try {
      // Check if configuration is loaded
      if (!this.configManager.isConfigurationLoaded()) {
        this.showMessage("Error: No project configuration loaded!");
        return;
      }

      // Get database configuration
      const dbConfig = this.configManager.getDatabaseConfig();
      if (!dbConfig) {
        this.showMessage("Error: No database configuration found in project!");
        return;
      }

      // Generate database scripts
      const projectMetadata = this.configManager.getProjectMetadata();
      const createTableScripts = this.generateCreateTableScripts(dbConfig);
      const foreignKeyScripts = this.generateForeignKeyScripts(dbConfig);

      // Show the generated scripts
      const message =
        `{bold}{green-fg}Database Scripts Generated Successfully!{/green-fg}{/bold}\n\n` +
        `{bold}Project:{/bold} ${projectMetadata.name}\n` +
        `{bold}Database Type:{/bold} ${dbConfig.type}\n` +
        `{bold}Tables:{/bold} ${dbConfig.tables.length}\n\n` +
        `{bold}CREATE TABLE Scripts:{/bold}\n\n` +
        `${createTableScripts}\n\n` +
        `{bold}ALTER TABLE Scripts (Foreign Keys):{/bold}\n\n` +
        `${foreignKeyScripts}\n\n` +
        `Press any key to continue...`;

      this.showMessage(message);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.showMessage(
        `Error generating database scripts: ${errorMessage}\n\nPress any key to continue...`
      );
    }
  }

  /**
   * Get the action name
   */
  public getActionName(): string {
    return "Generating Database Scripts";
  }

  /**
   * Get the action description
   */
  public getActionDescription(): string {
    return "This will create database schema and migration scripts.";
  }

  /**
   * Generate CREATE TABLE scripts for all tables
   * @private
   */
  private generateCreateTableScripts(dbConfig: DatabaseConfig): string {
    return dbConfig.tables
      .map((table) => this.generateCreateTableScript(table))
      .join("\n\n");
  }

  /**
   * Generate CREATE TABLE script for a single table
   * @private
   */
  private generateCreateTableScript(table: DatabaseTable): string {
    const tableName = table.name.toUpperCase();
    const fields = table.fields
      .map((field) => {
        let fieldDef = `  ${field.name.toUpperCase()} ${field.type.toUpperCase()}`;

        if (!field.nullable) {
          fieldDef += " NOT NULL";
        }

        if (field.default) {
          fieldDef += ` DEFAULT ${field.default}`;
        }

        return fieldDef;
      })
      .join(",\n");

    // Add primary key constraint
    const primaryKeyFields = table.fields
      .filter((f) => f.isPrimaryKey)
      .map((f) => f.name.toUpperCase());
    let constraints = "";
    if (primaryKeyFields.length > 0) {
      constraints = `,\n  CONSTRAINT PK_${tableName} PRIMARY KEY (${primaryKeyFields.join(
        ", "
      )})`;
    }

    return `CREATE TABLE ${tableName} (\n${fields}${constraints}\n);`;
  }

  /**
   * Generate ALTER TABLE scripts for foreign key constraints
   * @private
   */
  private generateForeignKeyScripts(dbConfig: DatabaseConfig): string {
    const scripts: string[] = [];

    dbConfig.tables.forEach((table) => {
      const foreignKeyFields = table.fields.filter(
        (f) => f.isForeignKey && f.foreignKey
      );

      foreignKeyFields.forEach((field) => {
        if (field.foreignKey) {
          const constraintName = `FK_${table.name.toUpperCase()}_${field.foreignKey.referencedTable.toUpperCase()}`;
          const script =
            `ALTER TABLE ${table.name.toUpperCase()} ADD CONSTRAINT ${constraintName} ` +
            `FOREIGN KEY (${field.name.toUpperCase()}) ` +
            `REFERENCES ${field.foreignKey.referencedTable.toUpperCase()}(${field.foreignKey.referencedColumn.toUpperCase()});`;
          scripts.push(script);
        }
      });
    });

    return scripts.join("\n");
  }

  /**
   * Generate database schema from project models
   * @private
   */
  private generateSchema(): void {
    // TODO: Implement schema generation logic
  }

  /**
   * Generate migration scripts
   * @private
   */
  private generateMigrations(): void {
    // TODO: Implement migration generation logic
  }

  /**
   * Generate seed data scripts
   * @private
   */
  private generateSeedData(): void {
    // TODO: Implement seed data generation logic
  }

  /**
   * Generate database configuration files
   * @private
   */
  private generateConfig(): void {
    // TODO: Implement config generation logic
  }
}
