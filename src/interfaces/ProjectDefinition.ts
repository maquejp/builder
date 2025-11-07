/**
 * Project Definition interfaces based on the schema
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

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
  database: string;
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
  type: string;
  tables: DatabaseTable[];
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
  database: DatabaseConfiguration;
}
