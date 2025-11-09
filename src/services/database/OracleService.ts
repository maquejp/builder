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
  ProjectDefinition,
} from "../../interfaces";
import { DatabaseHelper } from "./DatabaseHelper";
import { FileHelper } from "../../helpers";

interface ScriptFormatOptions {
  includeHeaders: boolean;
  sectionSeparators: boolean;
  indentSize: number;
  includeTimestamps: boolean;
  includeLineNumbers: boolean;
}

export class OracleService {
  private formatOptions: ScriptFormatOptions = {
    includeHeaders: true,
    sectionSeparators: true,
    indentSize: 4,
    includeTimestamps: true,
    includeLineNumbers: false,
  };

  private projectDefinition: ProjectDefinition | null = null;

  /**
   * Configure script formatting options
   */
  public setFormatOptions(options: Partial<ScriptFormatOptions>): void {
    this.formatOptions = { ...this.formatOptions, ...options };
  }

  /**
   * Execute Oracle database operations
   * @param config Database configuration from project definition
   * @param projectFolder The project folder name from the project definition
   * @param projectDefinition The full project definition (optional for backward compatibility)
   */
  public async execute(
    config: DatabaseConfiguration,
    projectFolder: string,
    projectDefinition?: ProjectDefinition
  ): Promise<void> {
    // Store project definition for use in script generation
    this.projectDefinition = projectDefinition || null;
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
    this.validateScriptReadability(completeScript);

    await this.delay(500);
    return completeScript;
  }

  /**
   * Generate script header with metadata
   */
  private generateScriptHeader(table: DatabaseTable): string {
    const tableName = table.name.toUpperCase();
    const timestamp = this.formatOptions.includeTimestamps
      ? new Date().toISOString().replace("T", " ").substring(0, 19)
      : "[timestamp]";

    // Use author from project definition if available, otherwise use default
    const author = this.projectDefinition?.author || "Joe Doe";
    const license = this.projectDefinition?.license || "MIT";

    return `-- ============================================================
-- STACKCRAFT ORACLE DATABASE SCRIPT
-- ============================================================
-- Table: ${tableName}
-- Generated: ${timestamp}
-- Author: ${author}
-- License: ${license}
-- Description: Auto-generated table definition with constraints and triggers
-- ============================================================`;
  }

  /**
   * Generate the main table definition section
   */
  private generateTableDefinition(table: DatabaseTable): string {
    const tableName = table.name.toUpperCase();
    const sectionHeader = this.generateSectionHeader(
      "TABLE DEFINITION",
      `Creating table structure for ${tableName}`
    );

    const fieldDefinitions = table.fields.map((field) => {
      return this.formatFieldDefinition(field);
    });

    const tableSQL = `CREATE TABLE ${tableName} (
${fieldDefinitions.map((field) => `    ${field}`).join(",\n")}
);`;

    return `${sectionHeader}

${tableSQL}`;
  }

  /**
   * Format individual field definition
   */
  private formatFieldDefinition(field: DatabaseField): string {
    const fieldName = field.name.toUpperCase();
    const fieldType = field.type.toUpperCase();

    let fieldDef = `${fieldName.padEnd(30)} ${fieldType}`;

    // Add nullable constraint
    if (field.nullable === false) {
      fieldDef += " NOT NULL";
    }

    // Add default value
    if (field.default) {
      const defaultValue = this.formatDefaultValue(field.default);
      fieldDef += ` DEFAULT ${defaultValue}`;
    }

    return fieldDef;
  }

  /**
   * Format default values properly for Oracle
   */
  private formatDefaultValue(defaultValue: string): string {
    const lowerDefault = defaultValue.toLowerCase();

    if (lowerDefault === "systimestamp") {
      return "SYSTIMESTAMP";
    } else if (lowerDefault === "sysdate") {
      return "SYSDATE";
    } else if (lowerDefault === "user") {
      return "USER";
    } else if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
      return defaultValue;
    } else if (/^\d+(\.\d+)?$/.test(defaultValue)) {
      return defaultValue;
    } else {
      return `'${defaultValue}'`;
    }
  }

  /**
   * Generate section header with consistent formatting
   */
  private generateSectionHeader(title: string, description?: string): string {
    const separator = "-- " + "=".repeat(60);
    let header = `${separator}\n-- ${title.toUpperCase()}`;
    if (description) {
      header += `\n-- ${description}`;
    }
    header += `\n${separator}`;
    return header;
  }

  /**
   * Generate constraints section
   */
  private generateConstraints(table: DatabaseTable): string | null {
    const constraintsScript = this.createConstraintsScript(table);
    if (!constraintsScript) {
      return null;
    }

    const sectionHeader = this.generateSectionHeader(
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

    const sectionHeader = this.generateSectionHeader(
      "TABLE TRIGGERS",
      "Auto-generated triggers for field updates"
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

    const sectionHeader = this.generateSectionHeader(
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
    const tableName = table.name.toUpperCase();
    return `-- ============================================================
-- END OF SCRIPT FOR TABLE: ${tableName}
-- ============================================================`;
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
      const pkConstraintName = `${tableName}_PK`;

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
      const fkConstraintName = `${tableName}_${referencedTable}_FK`;

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
      const uniqueConstraintName = `${tableName}_${fieldName}_UK`;

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
      const checkConstraintName = `${tableName}_${fieldName}_CK`;

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
      const conditionSuffix = condition ? "_COND" : "";
      const triggerName = `${tableName}_${triggerAbbrev}${conditionSuffix}_TRG`;

      // Use author and license from project definition if available
      const author =
        this.projectDefinition?.author || "Jean-Philippe Maquestiaux";
      const license = this.projectDefinition?.license || "EUPL-1.2";

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
   * Validate script readability and structure
   */
  private validateScriptReadability(script: string): void {
    const lines = script.split("\n");

    // Check for proper section headers
    const sectionHeaders = lines.filter(
      (line) => line.includes("=".repeat(60)) && line.startsWith("--")
    );

    if (sectionHeaders.length < 2) {
      console.warn(
        chalk.yellow("⚠️  Script may lack proper section organization")
      );
    }

    // Check for consistent indentation
    const indentedLines = lines.filter(
      (line) => line.startsWith("    ") || line.startsWith("\t")
    );

    if (
      indentedLines.length === 0 &&
      lines.some((line) => line.includes("CREATE"))
    ) {
      console.warn(chalk.yellow("⚠️  Script may lack proper indentation"));
    }

    // Validate script structure
    const hasHeader = script.includes("STACKCRAFT ORACLE DATABASE SCRIPT");
    const hasFooter = script.includes("END OF SCRIPT FOR TABLE:");

    if (!hasHeader || !hasFooter) {
      console.warn(chalk.yellow("⚠️  Script may be missing header or footer"));
    }

    console.log(chalk.green("✅ Script readability validation completed"));
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
