/**
 * Oracle Constraint Generator for handling Oracle database constraints
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseTable,
  DatabaseField,
  ProjectMetadata,
} from "../../../../interfaces";
import { DatabaseHelper, OracleHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Generates Oracle constraint scripts (Primary Keys, Foreign Keys, Unique, Check)
 */
export class OracleConstraintGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate constraints section with header
   */
  public generate(table: DatabaseTable): string | null {
    const constraintsScript = this.createConstraintsScript(table);
    if (!constraintsScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${constraintsScript}`;
  }

  /**
   * Get the section name for constraints
   */
  public getSectionName(): string {
    return "TABLE CONSTRAINTS";
  }

  /**
   * Get the section description for constraints
   */
  public getSectionDescription(): string {
    return "Primary keys, foreign keys, unique constraints, and check constraints";
  }

  /**
   * Generate constraints script content
   */
  private createConstraintsScript(table: DatabaseTable): string | null {
    const tableName = table.name.toUpperCase();
    const constraints: string[] = [];

    // 1. Create Primary Key Constraints
    const primaryKeyConstraint = this.generatePrimaryKeyConstraint(
      table,
      tableName
    );
    if (primaryKeyConstraint) {
      constraints.push(primaryKeyConstraint);
    }

    // 2. Create Foreign Key Constraints
    const foreignKeyConstraints = this.generateForeignKeyConstraints(
      table,
      tableName
    );
    constraints.push(...foreignKeyConstraints);

    // 3. Create Unique Constraints
    const uniqueConstraints = this.generateUniqueConstraints(table, tableName);
    constraints.push(...uniqueConstraints);

    // 4. Create Check Constraints for allowed values
    const checkConstraints = this.generateCheckConstraints(table, tableName);
    constraints.push(...checkConstraints);

    // Return constraints script if there are any constraints to create
    if (constraints.length > 0) {
      return constraints.join("\n\n");
    }

    return null;
  }

  /**
   * Generate Primary Key constraint
   */
  private generatePrimaryKeyConstraint(
    table: DatabaseTable,
    tableName: string
  ): string | null {
    const primaryKeyFields = table.fields.filter((field) => field.isPrimaryKey);
    if (primaryKeyFields.length === 0) {
      return null;
    }

    const pkColumns = primaryKeyFields
      .map((field) => field.name.toUpperCase())
      .join(", ");
    const pkConstraintName = OracleHelper.generateConstraintName(
      tableName,
      "PK"
    );

    return `-- Primary Key Constraint
ALTER TABLE ${tableName} 
    ADD CONSTRAINT ${pkConstraintName} 
    PRIMARY KEY (${pkColumns});`;
  }

  /**
   * Generate Foreign Key constraints
   */
  private generateForeignKeyConstraints(
    table: DatabaseTable,
    tableName: string
  ): string[] {
    const constraints: string[] = [];
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

    return constraints;
  }

  /**
   * Generate Unique constraints
   */
  private generateUniqueConstraints(
    table: DatabaseTable,
    tableName: string
  ): string[] {
    const constraints: string[] = [];
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

    return constraints;
  }

  /**
   * Generate Check constraints for allowed values
   */
  private generateCheckConstraints(
    table: DatabaseTable,
    tableName: string
  ): string[] {
    const constraints: string[] = [];
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

    return constraints;
  }
}
