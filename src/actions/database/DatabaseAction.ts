/**
 * Database action for generating database scripts
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BaseDatabaseScriptGenerator } from "./BaseDatabaseScriptGenerator";
import { OracleDatabaseScriptGenerator } from "./OracleDatabaseScriptGenerator";
import {
  DatabaseType,
  DatabaseSchema,
  DatabaseTable,
  ScriptGenerationOptions,
} from "./types";

export class DatabaseAction {
  /**
   * Generate database creation scripts for the given schema
   */
  public static generateDatabaseScripts(
    schema: DatabaseSchema,
    options: ScriptGenerationOptions = {}
  ): string {
    const generator = this.createGenerator(schema.type, options);

    // Validate all tables before generation
    const validationErrors = this.validateSchema(schema, generator);
    if (validationErrors.length > 0) {
      throw new Error(
        `Schema validation failed:\n${validationErrors.join("\n")}`
      );
    }

    return generator.generateDatabaseScripts(schema.tables);
  }

  /**
   * Generate scripts for a single table
   */
  public static generateTableScript(
    table: DatabaseTable,
    databaseType: DatabaseType,
    options: ScriptGenerationOptions = {}
  ): string {
    const generator = this.createGenerator(databaseType, options);

    // Validate the table
    const validationErrors = this.validateTable(table, generator);
    if (validationErrors.length > 0) {
      throw new Error(
        `Table validation failed:\n${validationErrors.join("\n")}`
      );
    }

    return generator.generateDatabaseScripts([table]);
  }

  /**
   * Validate database schema
   */
  public static validateSchema(
    schema: DatabaseSchema,
    generator?: BaseDatabaseScriptGenerator
  ): string[] {
    const errors: string[] = [];

    if (!generator) {
      generator = this.createGenerator(schema.type);
    }

    // Check for empty tables array
    if (!schema.tables || schema.tables.length === 0) {
      errors.push("Schema must contain at least one table");
      return errors;
    }

    // Check for duplicate table names
    const tableNames = schema.tables.map((t) => t.name.toLowerCase());
    const duplicateNames = tableNames.filter(
      (name, index) => tableNames.indexOf(name) !== index
    );
    if (duplicateNames.length > 0) {
      const uniqueDuplicates = Array.from(new Set(duplicateNames));
      errors.push(
        `Duplicate table names found: ${uniqueDuplicates.join(", ")}`
      );
    }

    // Validate each table
    schema.tables.forEach((table) => {
      const tableErrors = this.validateTable(table, generator!);
      errors.push(...tableErrors);
    });

    // Validate foreign key references
    errors.push(...this.validateForeignKeyReferences(schema.tables));

    return errors;
  }

  /**
   * Validate a single table
   */
  public static validateTable(
    table: DatabaseTable,
    generator?: BaseDatabaseScriptGenerator
  ): string[] {
    const errors: string[] = [];

    // Basic table validation
    if (!table.name || table.name.trim() === "") {
      errors.push("Table name cannot be empty");
    }

    if (!table.fields || table.fields.length === 0) {
      errors.push(`Table "${table.name}" must have at least one field`);
    }

    // Check for duplicate field names
    if (table.fields) {
      const fieldNames = table.fields.map((f) => f.name.toLowerCase());
      const duplicateFields = fieldNames.filter(
        (name, index) => fieldNames.indexOf(name) !== index
      );
      if (duplicateFields.length > 0) {
        const uniqueDuplicates = Array.from(new Set(duplicateFields));
        errors.push(
          `Duplicate field names in table "${
            table.name
          }": ${uniqueDuplicates.join(", ")}`
        );
      }
    }

    // Database-specific validation
    if (generator && generator instanceof OracleDatabaseScriptGenerator) {
      errors.push(...generator.validateTable(table));
    }

    return errors;
  }

  /**
   * Validate foreign key references between tables
   */
  private static validateForeignKeyReferences(
    tables: DatabaseTable[]
  ): string[] {
    const errors: string[] = [];
    const tableNames = new Set(tables.map((t) => t.name));

    tables.forEach((table) => {
      table.fields.forEach((field) => {
        if (field.isForeignKey && field.foreignKey) {
          const referencedTable = field.foreignKey.referencedTable;
          const referencedColumn = field.foreignKey.referencedColumn;

          // Check if referenced table exists
          if (!tableNames.has(referencedTable)) {
            errors.push(
              `Foreign key "${field.name}" in table "${table.name}" references non-existent table "${referencedTable}"`
            );
            return;
          }

          // Check if referenced column exists in referenced table
          const targetTable = tables.find((t) => t.name === referencedTable);
          if (targetTable) {
            const referencedFieldExists = targetTable.fields.some(
              (f) => f.name === referencedColumn
            );
            if (!referencedFieldExists) {
              errors.push(
                `Foreign key "${field.name}" in table "${table.name}" references non-existent column "${referencedColumn}" in table "${referencedTable}"`
              );
            }
          }
        }
      });
    });

    return errors;
  }

  /**
   * Create appropriate generator instance based on database type
   */
  private static createGenerator(
    databaseType: DatabaseType,
    options: ScriptGenerationOptions = {}
  ): BaseDatabaseScriptGenerator {
    switch (databaseType) {
      case DatabaseType.ORACLE:
        return new OracleDatabaseScriptGenerator(options);

      case DatabaseType.POSTGRESQL:
        // TODO: Implement PostgreSQL generator
        throw new Error("PostgreSQL generator not yet implemented");

      case DatabaseType.MYSQL:
        // TODO: Implement MySQL generator
        throw new Error("MySQL generator not yet implemented");

      case DatabaseType.SQLSERVER:
        // TODO: Implement SQL Server generator
        throw new Error("SQL Server generator not yet implemented");

      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }

  /**
   * Get supported database types
   */
  public static getSupportedDatabaseTypes(): DatabaseType[] {
    return [DatabaseType.ORACLE]; // Will expand as we implement more generators
  }

  /**
   * Check if a database type is supported
   */
  public static isDatabaseTypeSupported(databaseType: DatabaseType): boolean {
    return this.getSupportedDatabaseTypes().includes(databaseType);
  }
}
