/**
 * Database action types and interfaces
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

/**
 * Supported database management systems
 */
export enum DatabaseType {
  ORACLE = "Oracle",
  POSTGRESQL = "PostgreSQL",
  MYSQL = "MySQL",
  SQLSERVER = "SQLServer",
}

/**
 * Database field/column definition
 */
export interface DatabaseField {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isUnique?: boolean;
  default?: string;
  comment?: string;
  foreignKey?: {
    referencedTable: string;
    referencedColumn: string;
  };
  checkConstraint?: string;
  index?: boolean;
}

/**
 * Database table definition
 */
export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
  referencingTo?: string[];
  referencedBy?: string[];
  comment?: string;
}

/**
 * Database constraint definition
 */
export interface DatabaseConstraint {
  name: string;
  type: "PRIMARY_KEY" | "FOREIGN_KEY" | "UNIQUE" | "CHECK" | "NOT_NULL";
  tableName: string;
  columnName?: string;
  definition: string;
}

/**
 * Database index definition
 */
export interface DatabaseIndex {
  name: string;
  tableName: string;
  columns: string[];
  isUnique?: boolean;
}

/**
 * Database trigger definition
 */
export interface DatabaseTrigger {
  name: string;
  tableName: string;
  timing: "BEFORE" | "AFTER";
  event: "INSERT" | "UPDATE" | "DELETE";
  definition: string;
}

/**
 * Complete database schema definition
 */
export interface DatabaseSchema {
  type: DatabaseType;
  tables: DatabaseTable[];
}

/**
 * Generated script components
 */
export interface GeneratedScriptComponents {
  dropStatements: string[];
  tableCreation: string[];
  constraints: string[];
  indexes: string[];
  triggers: string[];
  comments: string[];
}

/**
 * Script generation options
 */
export interface ScriptGenerationOptions {
  includeDropStatements?: boolean;
  includeComments?: boolean;
  includeAuditColumns?: boolean;
  auditColumnNames?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };
  constraintNamingConvention?: ConstraintNamingConvention;
}

/**
 * Constraint naming convention configuration
 */
export interface ConstraintNamingConvention {
  primaryKey: string; // e.g., "{table}_pk"
  foreignKey: string; // e.g., "{table}_{column}_fk"
  unique: string; // e.g., "{table}_{column}_uk"
  check: string; // e.g., "{table}_{column}_chk"
  notNull: string; // e.g., "{table}_{column}_nn"
  index: string; // e.g., "{table}_{column}_idx"
}

/**
 * Default constraint naming conventions for Oracle
 */
export const DEFAULT_ORACLE_NAMING_CONVENTION: ConstraintNamingConvention = {
  primaryKey: "{table}_pk",
  foreignKey: "{table}_{column}_fk",
  unique: "{table}_{column}_uk",
  check: "{table}_{column}_chk",
  notNull: "{table}_{column}_nn",
  index: "{table}_{column}_idx",
};

/**
 * Default audit column names
 */
export const DEFAULT_AUDIT_COLUMNS = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  createdBy: "created_by",
  updatedBy: "updated_by",
};

/**
 * Package generation options for Oracle
 */
export interface PackageGenerationOptions {
  includeValidation?: boolean;
  includeExceptionHandling?: boolean;
  includeJsonSupport?: boolean;
  includePagination?: boolean;
  includeSearch?: boolean;
  packagePrefix?: string;
  utilityPackage?: string;
}

/**
 * Generated package components
 */
export interface GeneratedPackageComponents {
  specification: string;
  body: string;
  complete: string;
}
