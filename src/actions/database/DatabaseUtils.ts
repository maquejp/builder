/**
 * Database utility functions
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseField, DatabaseTable, DatabaseType } from "./types";

export class DatabaseUtils {
  /**
   * Convert project definition database config to our internal format
   */
  public static convertProjectDefinitionToSchema(projectDb: any): {
    type: DatabaseType;
    tables: DatabaseTable[];
  } {
    // Map database type string to enum
    let dbType: DatabaseType;
    switch (projectDb.type?.toLowerCase()) {
      case "oracle":
        dbType = DatabaseType.ORACLE;
        break;
      case "postgresql":
      case "postgres":
        dbType = DatabaseType.POSTGRESQL;
        break;
      case "mysql":
        dbType = DatabaseType.MYSQL;
        break;
      case "sqlserver":
      case "sql server":
        dbType = DatabaseType.SQLSERVER;
        break;
      default:
        throw new Error(`Unsupported database type: ${projectDb.type}`);
    }

    // Convert tables
    const tables: DatabaseTable[] =
      projectDb.tables?.map((table: any) => ({
        name: table.name,
        fields:
          table.fields?.map((field: any) => ({
            name: field.name,
            type: field.type,
            nullable: field.nullable !== false, // Default to true if not specified
            isPrimaryKey: field.isPrimaryKey === true,
            isForeignKey: field.isForeignKey === true,
            isUnique: field.isUnique === true,
            default: field.default,
            comment: field.comment,
            foreignKey: field.foreignKey
              ? {
                  referencedTable: field.foreignKey.referencedTable,
                  referencedColumn: field.foreignKey.referencedColumn,
                }
              : undefined,
            checkConstraint: field.checkConstraint,
            index: field.index === true,
          })) || [],
        referencingTo: table.referencingTo || [],
        referencedBy: table.referencedBy || [],
        comment: table.comment,
      })) || [];

    return {
      type: dbType,
      tables,
    };
  }

  /**
   * Sanitize table name for database use
   */
  public static sanitizeTableName(name: string): string {
    // Remove invalid characters and convert to lowercase
    return name
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/^[0-9]/, "_$&") // Ensure it doesn't start with a number
      .toLowerCase();
  }

  /**
   * Sanitize column name for database use
   */
  public static sanitizeColumnName(name: string): string {
    // Similar to table name sanitization
    return name
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/^[0-9]/, "_$&")
      .toLowerCase();
  }

  /**
   * Generate standard audit columns
   */
  public static generateAuditColumns(
    databaseType: DatabaseType
  ): DatabaseField[] {
    const timestampType = this.getTimestampType(databaseType);
    const currentTimestampFunc = this.getCurrentTimestampFunction(databaseType);

    return [
      {
        name: "created_at",
        type: timestampType,
        nullable: false,
        default: currentTimestampFunc,
        comment: "Record creation timestamp",
      },
      {
        name: "updated_at",
        type: timestampType,
        nullable: false,
        default: currentTimestampFunc,
        comment: "Record last update timestamp",
      },
    ];
  }

  /**
   * Get timestamp type for database
   */
  public static getTimestampType(databaseType: DatabaseType): string {
    switch (databaseType) {
      case DatabaseType.ORACLE:
        return "TIMESTAMP";
      case DatabaseType.POSTGRESQL:
        return "TIMESTAMP WITH TIME ZONE";
      case DatabaseType.MYSQL:
        return "TIMESTAMP";
      case DatabaseType.SQLSERVER:
        return "DATETIME2";
      default:
        return "TIMESTAMP";
    }
  }

  /**
   * Get current timestamp function for database
   */
  public static getCurrentTimestampFunction(
    databaseType: DatabaseType
  ): string {
    switch (databaseType) {
      case DatabaseType.ORACLE:
        return "CURRENT_TIMESTAMP";
      case DatabaseType.POSTGRESQL:
        return "CURRENT_TIMESTAMP";
      case DatabaseType.MYSQL:
        return "CURRENT_TIMESTAMP";
      case DatabaseType.SQLSERVER:
        return "GETDATE()";
      default:
        return "CURRENT_TIMESTAMP";
    }
  }

  /**
   * Check if a field name is reserved in the given database
   */
  public static isReservedWord(
    fieldName: string,
    databaseType: DatabaseType
  ): boolean {
    const reservedWords = this.getReservedWords(databaseType);
    return reservedWords.includes(fieldName.toUpperCase());
  }

  /**
   * Get reserved words for database type
   */
  public static getReservedWords(databaseType: DatabaseType): string[] {
    switch (databaseType) {
      case DatabaseType.ORACLE:
        return [
          "SELECT",
          "INSERT",
          "UPDATE",
          "DELETE",
          "CREATE",
          "DROP",
          "ALTER",
          "TABLE",
          "INDEX",
          "VIEW",
          "SEQUENCE",
          "TRIGGER",
          "PROCEDURE",
          "FUNCTION",
          "PACKAGE",
          "FROM",
          "WHERE",
          "ORDER",
          "GROUP",
          "HAVING",
          "UNION",
          "JOIN",
          "INNER",
          "LEFT",
          "RIGHT",
          "FULL",
          "OUTER",
          "ON",
          "AS",
          "IS",
          "NOT",
          "NULL",
          "AND",
          "OR",
          "IN",
          "EXISTS",
          "BETWEEN",
          "LIKE",
          "DISTINCT",
          "ALL",
          "ANY",
          "SOME",
          "CASE",
          "WHEN",
          "THEN",
          "ELSE",
          "END",
          "IF",
          "LOOP",
          "WHILE",
          "FOR",
          "CURSOR",
          "FETCH",
          "OPEN",
          "CLOSE",
          "COMMIT",
          "ROLLBACK",
          "SAVEPOINT",
          "GRANT",
          "REVOKE",
          "PUBLIC",
          "ROLE",
          "USER",
          "SYSTEM",
          "ADMIN",
        ];
      case DatabaseType.POSTGRESQL:
        return [
          "SELECT",
          "INSERT",
          "UPDATE",
          "DELETE",
          "CREATE",
          "DROP",
          "ALTER",
          "TABLE",
          "INDEX",
          "VIEW",
          "SEQUENCE",
          "TRIGGER",
          "FUNCTION",
          "PROCEDURE",
          "FROM",
          "WHERE",
          "ORDER",
          "GROUP",
          "HAVING",
          "UNION",
          "JOIN",
          "INNER",
          "LEFT",
          "RIGHT",
          "FULL",
          "OUTER",
          "ON",
          "AS",
          "IS",
          "NOT",
          "NULL",
          "AND",
          "OR",
          "IN",
          "EXISTS",
          "BETWEEN",
          "LIKE",
          "DISTINCT",
          "ALL",
          "ANY",
          "SOME",
          "CASE",
          "WHEN",
          "THEN",
          "ELSE",
          "END",
          "IF",
          "LOOP",
          "WHILE",
          "FOR",
          "CURSOR",
          "FETCH",
          "OPEN",
          "CLOSE",
          "COMMIT",
          "ROLLBACK",
          "SAVEPOINT",
          "GRANT",
          "REVOKE",
          "PUBLIC",
          "ROLE",
          "USER",
          "SYSTEM",
          "ADMIN",
        ];
      default:
        return [];
    }
  }

  /**
   * Escape reserved words with quotes
   */
  public static escapeReservedWord(
    fieldName: string,
    databaseType: DatabaseType
  ): string {
    if (this.isReservedWord(fieldName, databaseType)) {
      switch (databaseType) {
        case DatabaseType.ORACLE:
          return `"${fieldName.toUpperCase()}"`;
        case DatabaseType.POSTGRESQL:
          return `"${fieldName.toLowerCase()}"`;
        case DatabaseType.MYSQL:
          return `\`${fieldName}\``;
        case DatabaseType.SQLSERVER:
          return `[${fieldName}]`;
        default:
          return `"${fieldName}"`;
      }
    }
    return fieldName;
  }

  /**
   * Generate a standard primary key field
   */
  public static generatePrimaryKeyField(tableName: string): DatabaseField {
    return {
      name: "pk",
      type: "NUMBER",
      nullable: false,
      isPrimaryKey: true,
      comment: `Primary key for ${tableName} table`,
    };
  }

  /**
   * Infer foreign key field from relationship
   */
  public static generateForeignKeyField(
    referencedTable: string,
    referencedColumn: string = "pk"
  ): DatabaseField {
    return {
      name: `${referencedTable}_fk`,
      type: "NUMBER",
      nullable: true,
      isForeignKey: true,
      foreignKey: {
        referencedTable,
        referencedColumn,
      },
      comment: `Foreign key referencing ${referencedTable}.${referencedColumn}`,
    };
  }

  /**
   * Validate field name format
   */
  public static validateFieldName(name: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim() === "") {
      errors.push("Field name cannot be empty");
      return errors;
    }

    // Check length (common database limit)
    if (name.length > 30) {
      errors.push(`Field name "${name}" is too long (max 30 characters)`);
    }

    // Check for invalid characters
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      errors.push(
        `Field name "${name}" contains invalid characters or doesn't start with a letter`
      );
    }

    return errors;
  }

  /**
   * Validate table name format
   */
  public static validateTableName(name: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim() === "") {
      errors.push("Table name cannot be empty");
      return errors;
    }

    // Check length (common database limit)
    if (name.length > 30) {
      errors.push(`Table name "${name}" is too long (max 30 characters)`);
    }

    // Check for invalid characters
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      errors.push(
        `Table name "${name}" contains invalid characters or doesn't start with a letter`
      );
    }

    return errors;
  }
}
