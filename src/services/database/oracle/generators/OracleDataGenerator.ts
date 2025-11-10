/**
 * Oracle Data Generator for handling Oracle database data population
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, ProjectMetadata } from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Generates Oracle data population scripts (INSERT statements)
 * TODO: Implement data population logic based on table configuration
 */
export class OracleDataGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate data population section with header
   */
  public generate(table: DatabaseTable): string | null {
    const dataScript = this.createDataScript(table);
    if (!dataScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${dataScript}`;
  }

  /**
   * Get the section name for data population
   */
  public getSectionName(): string {
    return "INITIAL DATA";
  }

  /**
   * Get the section description for data population
   */
  public getSectionDescription(): string {
    return "Initial data population and seed data";
  }

  /**
   * Create data population script content
   */
  private createDataScript(table: DatabaseTable): string | null {
    const insertStatements: string[] = [];
    const recordCount = 22; // Generate at least 22 records for pagination testing

    // Get primary key field
    const primaryKeyField = table.fields.find((field) => field.isPrimaryKey);
    if (!primaryKeyField) {
      return null; // Skip tables without primary key
    }

    // Get foreign key fields with their reference information
    const foreignKeyFields = table.fields.filter((field) => field.isForeignKey);

    // Generate INSERT statements
    for (let i = 1; i <= recordCount; i++) {
      const fieldValues: string[] = [];
      const fieldNames: string[] = [];

      for (const field of table.fields) {
        // Skip timestamp fields with default values (SYSTIMESTAMP)
        if (field.default === "systimestamp" || field.trigger?.enabled) {
          continue;
        }

        fieldNames.push(field.name);
        fieldValues.push(this.generateFieldValue(field, i, table.name));
      }

      if (fieldNames.length > 0) {
        const insertStatement = `INSERT INTO ${table.name} (${fieldNames.join(
          ", "
        )}) VALUES (${fieldValues.join(", ")});`;
        insertStatements.push(insertStatement);
      }
    }

    if (insertStatements.length === 0) {
      return null;
    }

    // Add commit statement at the end
    insertStatements.push("COMMIT;");

    return insertStatements.join("\n");
  }

  /**
   * Generate appropriate value for a field based on its type and constraints
   */
  private generateFieldValue(
    field: any,
    recordIndex: number,
    tableName: string
  ): string {
    // Handle primary key
    if (field.isPrimaryKey) {
      return recordIndex.toString();
    }

    // Handle foreign keys
    if (field.isForeignKey) {
      // For foreign keys, we'll use a cyclic pattern to reference existing IDs
      // This assumes the referenced table also has 22+ records
      const referencedId = ((recordIndex - 1) % 22) + 1;
      return referencedId.toString();
    }

    // Handle allowed values (enums) first - this takes priority over data types
    if (field.allowedValues && field.allowedValues.length > 0) {
      const valueIndex = (recordIndex - 1) % field.allowedValues.length;
      const value = field.allowedValues[valueIndex];
      return typeof value === "string" ? `'${value}'` : value.toString();
    }

    // Handle different data types
    const fieldType = field.type.toLowerCase();

    if (fieldType.includes("varchar2") || fieldType.includes("char")) {
      return this.generateStringValue(field, recordIndex, tableName);
    }

    if (fieldType.includes("number")) {
      return this.generateNumberValue(field, recordIndex);
    }

    if (fieldType.includes("timestamp") || fieldType.includes("date")) {
      return "SYSTIMESTAMP";
    }

    // Default handling
    if (field.nullable) {
      return "NULL";
    }

    return `'DEFAULT_${recordIndex}'`;
  }

  /**
   * Generate string values based on field name and constraints
   */
  private generateStringValue(
    field: any,
    recordIndex: number,
    tableName: string
  ): string {
    const fieldName = field.name.toLowerCase();

    // Special handling for common field names
    if (fieldName.includes("description")) {
      return `'${tableName} description ${recordIndex}'`;
    }

    if (fieldName.includes("name")) {
      return `'${tableName} name ${recordIndex}'`;
    }

    if (fieldName.includes("title")) {
      return `'${tableName} title ${recordIndex}'`;
    }

    if (fieldName.includes("code")) {
      return `'${tableName.toUpperCase()}_${recordIndex
        .toString()
        .padStart(3, "0")}'`;
    }

    if (fieldName.includes("status")) {
      const statuses = ["ACTIVE", "INACTIVE", "PENDING", "COMPLETED"];
      const statusIndex = (recordIndex - 1) % statuses.length;
      return `'${statuses[statusIndex]}'`;
    }

    // Default string value
    return `'${tableName} ${fieldName} ${recordIndex}'`;
  }

  /**
   * Generate number values with some variation
   */
  private generateNumberValue(field: any, recordIndex: number): string {
    const fieldName = field.name.toLowerCase();

    if (fieldName.includes("priority")) {
      // Priority between 1-5
      return ((recordIndex % 5) + 1).toString();
    }

    if (fieldName.includes("quantity")) {
      // Quantity between 1-100
      return ((recordIndex % 100) + 1).toString();
    }

    if (fieldName.includes("amount") || fieldName.includes("price")) {
      // Amount/price with decimal places
      const amount = ((recordIndex * 10.5) % 1000) + 10;
      return amount.toFixed(2);
    }

    // Default number value
    return ((recordIndex * 10) % 1000).toString();
  }
}
