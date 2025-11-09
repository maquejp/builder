/**
 * Database interfaces
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
  trigger?: {
    enabled: boolean;
    event?:
      | "before_insert"
      | "before_update"
      | "before_insert_update"
      | "after_insert"
      | "after_update"
      | "after_insert_update";
    action?: string;
    condition?: string;
  };
}

// Database table definition interface
export interface DatabaseTable {
  name: string;
  referencingTo?: string[];
  referencedBy?: string[];
  fields: DatabaseField[];
}

// Database configuration interface
export interface DatabaseConfiguration {
  type: DatabaseType;
  tables: DatabaseTable[];
}
