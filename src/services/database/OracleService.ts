/**
 * Oracle Service for handling Oracle database specific operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import {
  DatabaseConfiguration,
  DatabaseTable,
  DatabaseField,
  ProjectMetadata,
  ScriptFormatOptions,
} from "../../interfaces";
import { DatabaseHelper, OracleHelper } from "./helpers";
import { FileHelper } from "../../helpers";

export class OracleService {
  private formatOptions: ScriptFormatOptions;
  private projectMetadata: ProjectMetadata | null = null;

  constructor() {
    this.formatOptions = OracleHelper.getFormatOptions();
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
   * Generate a complete, well-formatted table script
   */
  private async generateCompleteTableScript(
    table: DatabaseTable
  ): Promise<string> {
    console.log(chalk.blue(`🔧 Oracle Service: Creating table ${table.name}`));

    const sections = [
      this.generateScriptHeader(table),
      this.generateTableDefinition(table),
      this.generateConstraints(table),
      this.generateTriggers(table),
      this.generateComments(table),
      this.generateScriptFooter(table),
    ].filter((section) => section && section.trim().length > 0);

    const completeScript = sections.join("\n\n");

    // Validate script readability
    OracleHelper.validateScriptReadability(completeScript);

    await this.delay(500);
    return completeScript;
  }

  /**
   * Generate script header with metadata
   */
  private generateScriptHeader(table: DatabaseTable): string {
    return DatabaseHelper.generateScriptHeader(
      table.name,
      "ORACLE",
      this.formatOptions,
      this.projectMetadata
    );
  }

  /**
   * Generate the main table definition section
   */
  private generateTableDefinition(table: DatabaseTable): string {
    const tableName = table.name.toUpperCase();
    const sectionHeader = DatabaseHelper.generateSectionHeader(
      "TABLE DEFINITION",
      `Creating table structure for ${tableName}`
    );

    const fieldDefinitions = table.fields.map((field) => {
      return OracleHelper.formatFieldDefinition(field);
    });

    const tableSQL = `CREATE TABLE ${tableName} (
${fieldDefinitions.map((field) => `    ${field}`).join(",\n")}
);`;

    return `${sectionHeader}

${tableSQL}`;
  }

  /**
   * Generate constraints section
   */
  private generateConstraints(table: DatabaseTable): string | null {
    const constraintsScript = this.createConstraintsScript(table);
    if (!constraintsScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      "TABLE CONSTRAINTS",
      "Primary keys, foreign keys, unique constraints, and check constraints"
    );

    return `${sectionHeader}

${constraintsScript}`;
  }

  /**
   * Generate triggers section
   */
  private generateTriggers(table: DatabaseTable): string | null {
    const triggersScript = this.createTriggersScript(table);
    if (!triggersScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      "TABLE TRIGGERS",
      "Auto-increment triggers and custom triggers"
    );
    return `${sectionHeader}

${triggersScript}`;
  }

  /**
   * Generate comments section
   */
  private generateComments(table: DatabaseTable): string | null {
    const tableName = table.name.toUpperCase();
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

    if (comments.length === 0) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      "DOCUMENTATION & COMMENTS",
      "Field descriptions and documentation"
    );

    return `${sectionHeader}

${comments.join("\n")}`;
  }

  /**
   * Generate script footer
   */
  private generateScriptFooter(table: DatabaseTable): string {
    return DatabaseHelper.generateScriptFooter(table.name);
  }

  /**
   * Generate constraints script content
   */
  private createConstraintsScript(table: DatabaseTable): string | null {
    const tableName = table.name.toUpperCase();
    const constraints: string[] = [];

    // 1. Create Primary Key Constraints
    const primaryKeyFields = table.fields.filter((field) => field.isPrimaryKey);
    if (primaryKeyFields.length > 0) {
      const pkColumns = primaryKeyFields
        .map((field) => field.name.toUpperCase())
        .join(", ");
      const pkConstraintName = OracleHelper.generateConstraintName(
        tableName,
        "PK"
      );

      constraints.push(`-- Primary Key Constraint
ALTER TABLE ${tableName} 
    ADD CONSTRAINT ${pkConstraintName} 
    PRIMARY KEY (${pkColumns});`);
    }

    // 2. Create Foreign Key Constraints
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    for (const field of foreignKeyFields) {
      const fieldName = field.name.toUpperCase();
      const referencedTable = field.foreignKey!.referencedTable.toUpperCase();
      const referencedColumn = field.foreignKey!.referencedColumn.toUpperCase();
      const fkConstraintName = OracleHelper.generateConstraintName(
        tableName,
        "FK",
        fieldName,
        referencedTable
      );

      constraints.push(`-- Foreign Key Constraint for ${fieldName}
ALTER TABLE ${tableName} 
    ADD CONSTRAINT ${fkConstraintName} 
    FOREIGN KEY (${fieldName}) 
    REFERENCES ${referencedTable}(${referencedColumn});`);
    }

    // 3. Create Unique Constraints
    const uniqueFields = table.fields.filter((field) => field.unique);
    for (const field of uniqueFields) {
      const fieldName = field.name.toUpperCase();
      const uniqueConstraintName = OracleHelper.generateConstraintName(
        tableName,
        "UK",
        fieldName
      );

      constraints.push(`-- Unique Constraint for ${fieldName}
ALTER TABLE ${tableName} 
    ADD CONSTRAINT ${uniqueConstraintName} 
    UNIQUE (${fieldName});`);
    }

    // 4. Create Check Constraints for allowed values
    const fieldsWithAllowedValues = table.fields.filter(
      (field) => field.allowedValues && field.allowedValues.length > 0
    );
    for (const field of fieldsWithAllowedValues) {
      const fieldName = field.name.toUpperCase();
      const checkConstraintName = OracleHelper.generateConstraintName(
        tableName,
        "CK",
        fieldName
      );

      // Build the check condition with proper quoting for string values
      const allowedValues = field
        .allowedValues!.map((value) => {
          return typeof value === "string" ? `'${value}'` : value.toString();
        })
        .join(", ");

      constraints.push(`-- Check Constraint for ${fieldName}
-- Allowed values: ${field.allowedValues!.join(", ")}
ALTER TABLE ${tableName} 
    ADD CONSTRAINT ${checkConstraintName} 
    CHECK (${fieldName} IN (${allowedValues}));`);
    }

    // Return constraints script if there are any constraints to create
    if (constraints.length > 0) {
      return constraints.join("\n\n");
    }

    return null;
  }

  /**
   * Generate triggers script content
   */
  private createTriggersScript(table: DatabaseTable): string | null {
    // Find fields that have triggers enabled
    const fieldsWithTriggers = table.fields.filter(
      (field) => field.trigger?.enabled === true
    );

    if (fieldsWithTriggers.length === 0) {
      return null;
    }

    // Group fields by trigger event type to create combined triggers when possible
    const triggerGroups = new Map<string, DatabaseField[]>();

    fieldsWithTriggers.forEach((field) => {
      const event = field.trigger?.event || "before_update";
      const condition = field.trigger?.condition || "";
      const key = `${event}_${condition}`; // Group by event and condition

      if (!triggerGroups.has(key)) {
        triggerGroups.set(key, []);
      }
      triggerGroups.get(key)!.push(field);
    });

    const triggerScripts: string[] = [];

    // Generate triggers for each group
    for (const [key, fields] of triggerGroups) {
      if (fields.length === 0) continue;

      const tableName = table.name.toUpperCase();
      const firstField = fields[0];
      const event = firstField.trigger?.event || "before_update";
      const condition = firstField.trigger?.condition;

      // Parse event type for Oracle syntax
      const eventParts = event.split("_");
      const timing = eventParts[0].toUpperCase(); // BEFORE or AFTER
      const operations = eventParts
        .slice(1)
        .map((op: string) => op.toUpperCase())
        .join(" OR "); // INSERT, UPDATE, or INSERT OR UPDATE

      // Generate proper trigger abbreviation
      let triggerAbbrev = "";
      if (timing === "BEFORE") {
        if (operations.includes("INSERT") && operations.includes("UPDATE")) {
          triggerAbbrev = "BIU"; // Before Insert Update
        } else if (operations.includes("INSERT")) {
          triggerAbbrev = "BI"; // Before Insert
        } else if (operations.includes("UPDATE")) {
          triggerAbbrev = "BU"; // Before Update
        }
      } else if (timing === "AFTER") {
        if (operations.includes("INSERT") && operations.includes("UPDATE")) {
          triggerAbbrev = "AIU"; // After Insert Update
        } else if (operations.includes("INSERT")) {
          triggerAbbrev = "AI"; // After Insert
        } else if (operations.includes("UPDATE")) {
          triggerAbbrev = "AU"; // After Update
        }
      }

      // Generate trigger name
      const triggerName = OracleHelper.generateTriggerName(
        tableName,
        timing as "BEFORE" | "AFTER",
        operations,
        condition
      );

      // Use author and license from project metadata if available
      const author =
        this.projectMetadata?.author || "Jean-Philippe Maquestiaux";
      const license = this.projectMetadata?.license || "EUPL-1.2";

      let script = `-- Trigger: ${triggerName}\n`;
      script += `-- Generated by Stackcraft Oracle Service\n`;
      script += `-- Automatically updates: ${fields
        .map((f) => f.name)
        .join(", ")}\n`;
      script += `-- Author: ${author}\n`;
      script += `-- License: ${license}\n\n`;

      script += `CREATE OR REPLACE TRIGGER ${triggerName}\n`;
      script += `    ${timing} ${operations} ON ${tableName}\n`;
      script += `    FOR EACH ROW\n`;

      // Add condition if specified
      if (condition) {
        script += `    ${condition}\n`;
      }

      script += `BEGIN\n`;

      // Generate trigger body for each field
      fields.forEach((field) => {
        const fieldName = field.name.toUpperCase();
        const action = field.trigger?.action || "systimestamp";

        script += `    -- Auto-update ${fieldName}\n`;

        // Handle different action types
        if (action.toLowerCase() === "systimestamp") {
          script += `    :NEW.${fieldName} := SYSTIMESTAMP;\n`;
        } else if (action.toLowerCase() === "user") {
          script += `    :NEW.${fieldName} := USER;\n`;
        } else if (action.toLowerCase() === "sysdate") {
          script += `    :NEW.${fieldName} := SYSDATE;\n`;
        } else if (action.startsWith("'") && action.endsWith("'")) {
          // String literal
          script += `    :NEW.${fieldName} := ${action};\n`;
        } else if (/^\d+(\.\d+)?$/.test(action)) {
          // Numeric literal
          script += `    :NEW.${fieldName} := ${action};\n`;
        } else {
          // Custom PL/SQL expression or function call
          script += `    :NEW.${fieldName} := ${action};\n`;
        }

        script += `\n`;
      });

      script += `END ${triggerName};\n`;
      script += `/\n`; // Oracle SQL*Plus terminator

      triggerScripts.push(script);
    }

    if (triggerScripts.length > 0) {
      return triggerScripts.join("\n\n");
    }

    return null;
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
