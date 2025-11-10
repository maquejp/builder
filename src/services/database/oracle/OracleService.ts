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
  OracleViewGenerator,
  OracleCrudGenerator,
  OracleDataGenerator,
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

      await this.createView(table, projectFolder, i + 1);

      await this.createCrudPackage(table, projectFolder, i + 1);

      await this.populateTable(table, projectFolder, i + 1);
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

  /**
   * Generate and save initial data for the given table
   */
  private async populateTable(
    table: DatabaseTable,
    projectFolder: string,
    order: number
  ): Promise<void> {
    console.log(
      chalk.blue(
        `🔧 Oracle Service: Generating initial data for table ${table.name}`
      )
    );

    // Create a data generator instance
    const dataGenerator = new OracleDataGenerator(
      this.projectMetadata || undefined
    );

    // Generate the data script
    const dataScript = dataGenerator.generate(table);

    if (dataScript) {
      // Create a complete data script with header and footer
      const scriptHeader = DatabaseHelper.generateScriptHeader(
        `${table.name}_data`,
        "ORACLE",
        this.formatOptions,
        this.projectMetadata
      );

      const scriptFooter = DatabaseHelper.generateScriptFooter(
        `${table.name}_data`
      );

      const completeDataScript = `${scriptHeader}

${dataScript}

${scriptFooter}`;

      // Ensure the data directory exists
      await FileHelper.ensureDatabaseDir(projectFolder, "data");

      // Save the data script to file with the same order as the table
      await FileHelper.saveDatabaseScript({
        projectFolder,
        scriptType: "data",
        fileName: `${table.name.toLowerCase()}_data`,
        content: completeDataScript,
        order: order,
      });

      console.log(
        chalk.green(
          `✅ Oracle Service: Generated 22 data records for table ${table.name}`
        )
      );
    } else {
      console.log(
        chalk.yellow(
          `⚠️ Oracle Service: Data script not generated for table ${table.name} (no primary key found or no applicable fields)`
        )
      );
    }

    await this.delay(500);
  }

  /**
   * Create Oracle view script for the given table
   */
  private async createView(
    table: DatabaseTable,
    projectFolder: string,
    order: number
  ): Promise<void> {
    console.log(
      chalk.blue(`🔧 Oracle Service: Creating view for table ${table.name}`)
    );

    // Create a view generator instance
    const viewGenerator = new OracleViewGenerator(
      this.projectMetadata || undefined
    );

    // Generate the complete view script
    const viewScript = viewGenerator.generateViewScript(table);

    // Ensure the views directory exists
    await FileHelper.ensureDatabaseDir(projectFolder, "views");

    // Save the view script to file with the same order as the table
    await FileHelper.saveDatabaseScript({
      projectFolder,
      scriptType: "views",
      fileName: `${table.name.toLowerCase()}_v`,
      content: viewScript,
      order: order,
    });

    await this.delay(500);
  }

  /**
   * Create CRUD package for the given table
   */
  private async createCrudPackage(
    table: DatabaseTable,
    projectFolder: string,
    order: number
  ): Promise<void> {
    console.log(
      chalk.blue(
        `🔧 Oracle Service: Creating CRUD package for table ${table.name}`
      )
    );

    // Create a CRUD generator instance
    const crudGenerator = new OracleCrudGenerator(
      this.projectMetadata || undefined
    );

    // Generate the complete CRUD package script
    const crudScript = crudGenerator.generate(table);

    if (crudScript) {
      // Ensure the packages directory exists
      await FileHelper.ensureDatabaseDir(projectFolder, "packages");

      // Save the CRUD package script to file with the same order as the table
      await FileHelper.saveDatabaseScript({
        projectFolder,
        scriptType: "packages",
        fileName: `p_${table.name.toLowerCase()}`,
        content: crudScript,
        order: order,
      });
    } else {
      console.log(
        chalk.yellow(
          `⚠️ Oracle Service: CRUD package not generated for table ${table.name} (no primary key found)`
        )
      );
    }

    await this.delay(500);
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
