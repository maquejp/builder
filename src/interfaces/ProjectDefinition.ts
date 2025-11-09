/**
 * Project Definition interfaces based on the schema
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

// Database type enumeration
export enum DatabaseType {
  ORACLE = "Oracle",
  POSTGRESQL = "PostgreSQL",
  MYSQL = "MySQL",
  SQLITE = "SQLite",
  MONGODB = "MongoDB",
}

// Database field definition interface
export interface DatabaseField {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKey?: {
    referencedTable: string;
    referencedColumn: string;
  };
  default?: string;
  unique?: boolean;
  allowedValues?: (string | number)[];
  comment?: string;
}

// Database table definition interface
export interface DatabaseTable {
  name: string;
  referencingTo?: string[];
  referencedBy?: string[];
  fields: DatabaseField[];
}

// Technology stack definition interface
export interface TechnologyStack {
  database: {
    type: DatabaseType;
    version?: string;
  };
  backend: {
    type: string;
    framework: string;
  };
  frontend: {
    type: string;
    framework: string;
  };
}

// Database configuration interface
export interface DatabaseConfiguration {
  type: DatabaseType;
  tables: DatabaseTable[];
}

// Backend configuration interface
export interface BackendConfiguration {
  type: string;
  framework: string;
}

// Frontend configuration interface
export interface FrontendConfiguration {
  type: string;
  framework: string;
}

// Main project definition interface
export interface ProjectDefinition {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  projectFolder: string;
  stack: TechnologyStack;
  database?: DatabaseConfiguration;
  backend?: BackendConfiguration;
  frontend?: FrontendConfiguration;
}
