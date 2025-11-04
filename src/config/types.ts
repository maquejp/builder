/**
 * Configuration types for the Stackcraft application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

/**
 * Foreign key reference information
 */
export interface ForeignKeyReference {
  referencedTable: string;
  referencedColumn: string;
}

/**
 * Database field definition
 */
export interface DatabaseField {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKey?: ForeignKeyReference;
  default?: string;
  comment?: string;
}

/**
 * Database table definition
 */
export interface DatabaseTable {
  name: string;
  referencingTo?: string[];
  referencedBy?: string[];
  fields: DatabaseField[];
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  type: string;
  tables: DatabaseTable[];
}

/**
 * Frontend configuration
 */
export interface FrontendConfig {
  framework?: string;
  version?: string;
  components?: string[];
  routing?: boolean;
  authentication?: boolean;
}

/**
 * Backend configuration
 */
export interface BackendConfig {
  framework?: string;
  version?: string;
  port?: number;
  apiPrefix?: string;
  authentication?: boolean;
  cors?: boolean;
}

/**
 * Stack configuration
 */
export interface StackConfig {
  database?: string;
  backend?: {
    type: string;
    framework?: string;
  };
  frontend?: {
    type: string;
    framework?: string;
  };
}

/**
 * Main project configuration structure
 */
export interface ProjectConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  projectFolder: string;
  stack?: StackConfig;
  database?: DatabaseConfig;
  frontend?: FrontendConfig;
  backend?: BackendConfig;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
