/**
 * Oracle database script generator
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BaseDatabaseScriptGenerator } from "./BaseDatabaseScriptGenerator";
import {
  DatabaseType,
  DatabaseTable,
  DatabaseField,
  ConstraintNamingConvention,
  DEFAULT_ORACLE_NAMING_CONVENTION,
} from "./types";

export class OracleDatabaseScriptGenerator extends BaseDatabaseScriptGenerator {
  constructor(options = {}) {
    super(DatabaseType.ORACLE, options);
  }

  /**
   * Generate Oracle DROP statement for table
   */
  protected generateDropStatement(table: DatabaseTable): string {
    return `DROP TABLE ${table.name} CASCADE CONSTRAINTS PURGE;`;
  }

  /**
   * Generate Oracle CREATE TABLE statement
   */
  protected generateTableCreation(table: DatabaseTable): string {
    const fields = this.addAuditColumns(table.fields);
    const lines: string[] = [];

    lines.push(`CREATE TABLE ${table.name} (`);

    // Generate column definitions
    const columnDefinitions = fields.map((field) => {
      return "   " + this.generateColumnDefinition(field);
    });

    lines.push(columnDefinitions.join(",\n"));
    lines.push(");");

    return lines.join("\n");
  }

  /**
   * Generate column definition for Oracle
   */
  private generateColumnDefinition(field: DatabaseField): string {
    let definition = `${field.name.padEnd(15)} ${field.type}`;

    // Add default value if specified and not for primary key
    if (field.default && !field.isPrimaryKey) {
      definition += ` DEFAULT ${field.default}`;
    }

    return definition;
  }

  /**
   * Generate constraints for Oracle table
   */
  protected generateConstraints(table: DatabaseTable): string[] {
    const constraints: string[] = [];
    const fields = this.addAuditColumns(table.fields);

    // Primary key constraints
    const primaryKeyFields = fields.filter((f) => f.isPrimaryKey);
    if (primaryKeyFields.length > 0) {
      const pkConstraintName = this.generateConstraintName(
        "primaryKey",
        table.name
      );
      const pkColumns = primaryKeyFields.map((f) => f.name).join(", ");
      constraints.push(
        `ALTER TABLE ${table.name}\n   ADD CONSTRAINT ${pkConstraintName} PRIMARY KEY (${pkColumns})\n      USING INDEX ENABLE;`
      );
    }

    // Not null constraints
    fields.forEach((field) => {
      if (!field.nullable && !field.isPrimaryKey) {
        const nnConstraintName = this.generateConstraintName(
          "notNull",
          table.name,
          field.name
        );
        constraints.push(
          `ALTER TABLE ${table.name} MODIFY (\n   ${field.name}\n      CONSTRAINT ${nnConstraintName} NOT NULL\n);`
        );
      }
    });

    // Unique constraints
    fields.forEach((field) => {
      if (field.isUnique && !field.isPrimaryKey) {
        const ukConstraintName = this.generateConstraintName(
          "unique",
          table.name,
          field.name
        );
        constraints.push(
          `ALTER TABLE ${table.name}\n   ADD CONSTRAINT ${ukConstraintName} UNIQUE (${field.name});`
        );
      }
    });

    // Check constraints
    fields.forEach((field) => {
      if (field.checkConstraint) {
        const chkConstraintName = this.generateConstraintName(
          "check",
          table.name,
          field.name
        );
        constraints.push(
          `ALTER TABLE ${table.name}\n   ADD CONSTRAINT ${chkConstraintName} CHECK (${field.checkConstraint});`
        );
      }
    });

    // Foreign key constraints
    fields.forEach((field) => {
      if (field.isForeignKey && field.foreignKey) {
        const fkConstraintName = this.generateConstraintName(
          "foreignKey",
          table.name,
          field.name
        );
        constraints.push(
          `ALTER TABLE ${table.name}\n   ADD CONSTRAINT ${fkConstraintName} FOREIGN KEY (${field.name})\n      REFERENCES ${field.foreignKey.referencedTable} (${field.foreignKey.referencedColumn});`
        );
      }
    });

    return constraints;
  }

  /**
   * Generate indexes for Oracle table
   */
  protected generateIndexes(table: DatabaseTable): string[] {
    const indexes: string[] = [];
    const fields = this.addAuditColumns(table.fields);

    fields.forEach((field) => {
      if (field.index && !field.isPrimaryKey && !field.isUnique) {
        const indexName = this.generateConstraintName(
          "index",
          table.name,
          field.name
        );
        indexes.push(
          `CREATE INDEX ${indexName} ON ${table.name} (\n   ${field.name}\n);`
        );
      }
    });

    return indexes;
  }

  /**
   * Generate triggers for Oracle table
   */
  protected generateTriggers(table: DatabaseTable): string[] {
    const triggers: string[] = [];

    // Only generate update trigger if audit columns are enabled
    if (this.options.includeAuditColumns) {
      const updateTriggerName = `trg_${table.name}_${this.options.auditColumnNames.updatedAt}`;
      const updatedAtColumn = this.options.auditColumnNames.updatedAt;

      triggers.push(
        `-- Trigger to automatically update "${updatedAtColumn}" on row update\nCREATE OR REPLACE TRIGGER ${updateTriggerName}\n   BEFORE UPDATE ON ${table.name}\n   FOR EACH ROW\nBEGIN\n   :NEW.${updatedAtColumn} := CURRENT_TIMESTAMP;\nEND;\n/`
      );
    }

    return triggers;
  }

  /**
   * Generate comments for Oracle table and columns
   */
  protected generateComments(table: DatabaseTable): string[] {
    const comments: string[] = [];
    const fields = this.addAuditColumns(table.fields);

    // Table comment
    if (table.comment) {
      comments.push(`COMMENT ON TABLE ${table.name} IS '${table.comment}';`);
    }

    // Column comments
    fields.forEach((field) => {
      if (field.comment) {
        comments.push(
          `COMMENT ON COLUMN ${table.name}.${field.name} IS '${field.comment}';`
        );
      }
    });

    return comments;
  }

  /**
   * Get Oracle timestamp type
   */
  protected getTimestampType(): string {
    return "TIMESTAMP";
  }

  /**
   * Get Oracle current timestamp function
   */
  protected getCurrentTimestampFunction(): string {
    return "CURRENT_TIMESTAMP";
  }

  /**
   * Get default Oracle naming convention
   */
  protected getDefaultNamingConvention(): ConstraintNamingConvention {
    return DEFAULT_ORACLE_NAMING_CONVENTION;
  }

  /**
   * Validate Oracle-specific field types and constraints
   */
  public validateTable(table: DatabaseTable): string[] {
    const errors: string[] = [];
    const fields = this.addAuditColumns(table.fields);

    // Check for at least one primary key
    const primaryKeyFields = fields.filter((f) => f.isPrimaryKey);
    if (primaryKeyFields.length === 0) {
      errors.push(
        `Table "${table.name}" must have at least one primary key column`
      );
    }

    // Validate Oracle data types
    fields.forEach((field) => {
      if (!this.isValidOracleDataType(field.type)) {
        errors.push(
          `Invalid Oracle data type "${field.type}" for column "${field.name}" in table "${table.name}"`
        );
      }
    });

    // Check for circular foreign key references within the same table
    const selfReferences = fields.filter(
      (f) => f.isForeignKey && f.foreignKey?.referencedTable === table.name
    );
    if (selfReferences.length > 1) {
      errors.push(
        `Table "${table.name}" has multiple self-referencing foreign keys which may cause issues`
      );
    }

    return errors;
  }

  /**
   * Check if a data type is valid for Oracle
   */
  private isValidOracleDataType(dataType: string): boolean {
    const oracleTypes = [
      "NUMBER",
      "INTEGER",
      "FLOAT",
      "BINARY_FLOAT",
      "BINARY_DOUBLE",
      "VARCHAR2",
      "NVARCHAR2",
      "CHAR",
      "NCHAR",
      "CLOB",
      "NCLOB",
      "DATE",
      "TIMESTAMP",
      "TIMESTAMP WITH TIME ZONE",
      "TIMESTAMP WITH LOCAL TIME ZONE",
      "INTERVAL YEAR TO MONTH",
      "INTERVAL DAY TO SECOND",
      "RAW",
      "LONG RAW",
      "BLOB",
      "BFILE",
      "ROWID",
      "UROWID",
    ];

    // Convert to uppercase and check if it starts with any valid Oracle type
    const upperType = dataType.toUpperCase();
    return oracleTypes.some((type) => upperType.startsWith(type));
  }
}
