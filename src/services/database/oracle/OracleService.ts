/**
 * Refactored Oracle Service using specialized generators
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import {
  DatabaseConfiguration,
  DatabaseTable,
  ProjectMetadata,
  ScriptFormatOptions,
} from "../../../interfaces";
import { DatabaseHelper, OracleHelper } from "../helpers";
import { FileHelper } from "../../../helpers";
import { BaseScriptGenerator } from "../generators";
import {
  OracleTableGenerator,
  OracleConstraintGenerator,
  OracleTriggerGenerator,
  OracleCommentGenerator,
} from "./generators";

export class OracleService {
  private formatOptions: ScriptFormatOptions;
  private projectMetadata: ProjectMetadata | null = null;
  private generators: BaseScriptGenerator[] = [];

  constructor() {
    this.formatOptions = OracleHelper.getFormatOptions();
    this.initializeGenerators();
  }

  /**
   * Initialize all script generators
   */
  private initializeGenerators(): void {
    this.generators = [
      new OracleTableGenerator(),
      new OracleConstraintGenerator(),
      new OracleTriggerGenerator(),
      new OracleCommentGenerator(),
    ];
  }

  /**
   * Execute Oracle database operations
   * @param config Database configuration from project definition
   * @param projectFolder The project folder name from the project definition
   * @param metadata Project metadata (author, license) for script generation
   */
  public async execute(
    config: DatabaseConfiguration,
    projectFolder: string,
    metadata?: ProjectMetadata
  ): Promise<void> {
    // Store project metadata for use in script generation
    this.projectMetadata = metadata || null;
    this.updateGeneratorsMetadata();

    console.log(
      chalk.blue("🔧 Oracle Service: Starting Oracle database operations...")
    );

    // Display tables information
    DatabaseHelper.showTables(config.tables);

    // Sort tables based on dependencies (referenced tables first)
    const sortedTables = DatabaseHelper.sortTablesByDependencies(config.tables);

    // Ensure the database directories exist
    await FileHelper.ensureDatabaseDir(projectFolder, "tables");

    // Process each table
    for (let i = 0; i < sortedTables.length; i++) {
      const table = sortedTables[i];
      const tableScript = await this.generateCompleteTableScript(table);

      // Save the table script to file using FileHelper with order number
      await FileHelper.saveDatabaseScript({
        projectFolder,
        scriptType: "tables",
        fileName: table.name,
        content: tableScript,
        order: i + 1, // Start from 1 instead of 0
      });

      await this.populateTable(table);
      await this.createView(table);
      await this.createCrudPackage(table);
    }

    console.log(
      chalk.green("✅ Oracle Service: Operations completed successfully")
    );
  }

  /**
   * Update project metadata for all generators
   */
  private updateGeneratorsMetadata(): void {
    this.generators.forEach((generator) => {
      if ("setProjectMetadata" in generator) {
        (generator as any).setProjectMetadata(this.projectMetadata);
      }
    });
  }

  /**
   * Generate a complete, well-formatted table script using generators
   */
  private async generateCompleteTableScript(
    table: DatabaseTable
  ): Promise<string> {
    console.log(chalk.blue(`🔧 Oracle Service: Creating table ${table.name}`));

    // Generate header
    const scriptHeader = DatabaseHelper.generateScriptHeader(
      table.name,
      "ORACLE",
      this.formatOptions,
      this.projectMetadata
    );

    // Generate sections using generators
    const sections = [scriptHeader];

    for (const generator of this.generators) {
      const section = generator.generate(table);
      if (section && section.trim().length > 0) {
        sections.push(section);
      }
    }

    // Generate footer
    const scriptFooter = DatabaseHelper.generateScriptFooter(table.name);
    sections.push(scriptFooter);

    // Filter out empty sections and join
    const completeScript = sections
      .filter((section) => section && section.trim().length > 0)
      .join("\n\n");

    // Validate script readability
    OracleHelper.validateScriptReadability(completeScript);

    await this.delay(500);
    return completeScript;
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
