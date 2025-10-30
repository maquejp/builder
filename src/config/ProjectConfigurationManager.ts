/**
 * ProjectConfigurationManager - Manages project configuration loading and access
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as fs from "fs";
import * as path from "path";
import {
  ProjectConfig,
  DatabaseConfig,
  DatabaseTable,
  FrontendConfig,
  BackendConfig,
  TestingConfig,
  ValidationResult,
} from "./types";

/**
 * Configuration manager for project configuration
 * Handles loading, parsing, validation, and providing access to configuration data
 */
export class ProjectConfigurationManager {
  private config: ProjectConfig | null = null;
  private configFilePath: string | null = null;

  constructor() {
    // Constructor can be empty as configuration is loaded on demand
  }

  /**
   * Load configuration from a JSON file
   * @param filePath Path to the configuration JSON file
   */
  public async loadFromFile(
    filePath: string,
    showWarnings: boolean = false
  ): Promise<void> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Configuration file not found: ${absolutePath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, "utf-8");
      const parsedConfig = JSON.parse(fileContent) as ProjectConfig;

      // Validate the configuration
      const validation = this.validateConfiguration(parsedConfig);
      if (!validation.isValid) {
        throw new Error(
          `Configuration validation failed:\n${validation.errors.join("\n")}`
        );
      }

      this.config = parsedConfig;
      this.configFilePath = absolutePath;

      // Log warnings if any
      if (showWarnings && validation.warnings.length > 0) {
        console.warn("Configuration warnings:", validation.warnings.join("\n"));
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load configuration: ${error.message}`);
      }
      throw new Error("Failed to load configuration: Unknown error");
    }
  }

  /**
   * Load configuration from a JSON object
   * @param configObject Configuration object
   */
  public loadFromObject(
    configObject: ProjectConfig,
    showWarnings: boolean = false
  ): void {
    const validation = this.validateConfiguration(configObject);
    if (!validation.isValid) {
      throw new Error(
        `Configuration validation failed:\n${validation.errors.join("\n")}`
      );
    }

    this.config = configObject;
    this.configFilePath = null;

    // Log warnings if any
    if (showWarnings && validation.warnings.length > 0) {
      console.warn("Configuration warnings:\n", validation.warnings.join("\n"));
    }
  }

  /**
   * Get the full project configuration
   */
  public getProjectConfig(): ProjectConfig {
    this.ensureConfigLoaded();
    return this.config!;
  }

  /**
   * Get project metadata
   */
  public getProjectMetadata(): Pick<
    ProjectConfig,
    "name" | "version" | "description" | "author" | "license" | "projectFolder"
  > {
    this.ensureConfigLoaded();
    const config = this.config!;
    return {
      name: config.name,
      version: config.version,
      description: config.description,
      author: config.author,
      license: config.license,
      projectFolder: config.projectFolder,
    };
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig(): DatabaseConfig | null {
    this.ensureConfigLoaded();
    return this.config!.database || null;
  }

  /**
   * Get frontend configuration
   */
  public getFrontendConfig(): FrontendConfig | null {
    this.ensureConfigLoaded();
    return this.config!.frontend || null;
  }

  /**
   * Get backend configuration
   */
  public getBackendConfig(): BackendConfig | null {
    this.ensureConfigLoaded();
    return this.config!.backend || null;
  }

  /**
   * Get testing configuration
   */
  public getTestingConfig(): TestingConfig | null {
    this.ensureConfigLoaded();
    return this.config!.testing || null;
  }

  /**
   * Get all database tables
   */
  public getDatabaseTables(): DatabaseTable[] {
    const dbConfig = this.getDatabaseConfig();
    return dbConfig?.tables || [];
  }

  /**
   * Get a specific database table by name
   */
  public getDatabaseTable(tableName: string): DatabaseTable | null {
    const tables = this.getDatabaseTables();
    return tables.find((table) => table.name === tableName) || null;
  }

  /**
   * Check if configuration is loaded
   */
  public isConfigurationLoaded(): boolean {
    return this.config !== null;
  }

  /**
   * Get the path of the loaded configuration file
   */
  public getConfigurationFilePath(): string | null {
    return this.configFilePath;
  }

  /**
   * Validate the project configuration
   */
  private validateConfiguration(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!config.name || typeof config.name !== "string") {
      errors.push("Project name is required and must be a string");
    }

    if (!config.version || typeof config.version !== "string") {
      errors.push("Project version is required and must be a string");
    }

    if (!config.description || typeof config.description !== "string") {
      errors.push("Project description is required and must be a string");
    }

    if (!config.author || typeof config.author !== "string") {
      errors.push("Project author is required and must be a string");
    }

    if (!config.license || typeof config.license !== "string") {
      errors.push("Project license is required and must be a string");
    }

    if (!config.projectFolder || typeof config.projectFolder !== "string") {
      errors.push("Project folder is required and must be a string");
    }

    // Database configuration validation
    if (config.database) {
      if (!config.database.type || typeof config.database.type !== "string") {
        errors.push(
          "Database type is required when database configuration is present"
        );
      }

      if (!config.database.tables || !Array.isArray(config.database.tables)) {
        errors.push(
          "Database tables must be an array when database configuration is present"
        );
      } else {
        // Validate each table
        config.database.tables.forEach((table: any, index: number) => {
          if (!table.name || typeof table.name !== "string") {
            errors.push(`Table at index ${index} must have a valid name`);
          }

          if (!table.fields || !Array.isArray(table.fields)) {
            errors.push(
              `Table '${table.name || index}' must have a fields array`
            );
          } else {
            // Validate each field
            table.fields.forEach((field: any, fieldIndex: number) => {
              if (!field.name || typeof field.name !== "string") {
                errors.push(
                  `Field at index ${fieldIndex} in table '${table.name}' must have a valid name`
                );
              }

              if (!field.type || typeof field.type !== "string") {
                errors.push(
                  `Field '${field.name}' in table '${table.name}' must have a valid type`
                );
              }

              // Validate foreign key reference if present
              if (field.isForeignKey && !field.foreignKey) {
                errors.push(
                  `Field '${field.name}' in table '${table.name}' is marked as foreign key but missing foreignKey configuration`
                );
              }

              if (field.foreignKey) {
                if (
                  !field.foreignKey.referencedTable ||
                  !field.foreignKey.referencedColumn
                ) {
                  errors.push(
                    `Foreign key in field '${field.name}' of table '${table.name}' must specify referencedTable and referencedColumn`
                  );
                }
              }
            });
          }
        });
      }
    }

    // Add warnings for optional configurations
    if (!config.frontend) {
      warnings.push("No frontend configuration specified");
    }

    if (!config.backend) {
      warnings.push("No backend configuration specified");
    }

    if (!config.testing) {
      warnings.push("No testing configuration specified");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Ensure configuration is loaded, throw error if not
   */
  private ensureConfigLoaded(): void {
    if (!this.config) {
      throw new Error(
        "Configuration not loaded. Please call loadFromFile() or loadFromObject() first."
      );
    }
  }

  /**
   * Reload configuration from the original file (if loaded from file)
   */
  public async reload(): Promise<void> {
    if (!this.configFilePath) {
      throw new Error("Cannot reload configuration: not loaded from file");
    }
    await this.loadFromFile(this.configFilePath);
  }
}
