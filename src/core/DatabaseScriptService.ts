/**
 * Database script generation service
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseAction,
  DatabaseUtils,
  DatabaseType,
} from "../actions/database";
import { ProjectConfig } from "../config/types";
import * as fs from "fs";
import * as path from "path";

export interface ScriptGenerationResult {
  success: boolean;
  message: string;
  filePath?: string;
  error?: string;
  details?: {
    tablesProcessed: number;
    tableNames: string[];
    scriptLength: number;
  };
}

export class DatabaseScriptService {
  /**
   * Generate database scripts from project configuration
   */
  public static async generateScripts(
    projectConfig: ProjectConfig,
    outputDir?: string
  ): Promise<ScriptGenerationResult> {
    try {
      // Validate project has database configuration
      if (!projectConfig.database) {
        return {
          success: false,
          message: "No database configuration found in project",
          error: "Project must have database configuration to generate scripts",
        };
      }

      // Convert project database config to internal schema format
      const schema = DatabaseUtils.convertProjectDefinitionToSchema(
        projectConfig.database
      );

      // Validate the schema
      const validationErrors = DatabaseAction.validateSchema(schema);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: "Database schema validation failed",
          error: validationErrors.join("\n"),
        };
      }

      // Generate the SQL script
      const sqlScript = DatabaseAction.generateDatabaseScripts(schema, {
        includeDropStatements: true,
        includeComments: true,
        includeAuditColumns: true,
      });

      // Determine output file path
      const outputPath = this.getOutputFilePath(
        projectConfig,
        schema.type,
        outputDir
      );

      // Create output directory if it doesn't exist
      const outputDirectory = path.dirname(outputPath);
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      // Write script to file
      fs.writeFileSync(outputPath, sqlScript, "utf8");

      return {
        success: true,
        message: "Database scripts generated successfully",
        filePath: outputPath,
        details: {
          tablesProcessed: schema.tables.length,
          tableNames: schema.tables.map((t) => t.name),
          scriptLength: sqlScript.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Error generating database scripts",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Generate scripts and return content without saving to file
   */
  public static generateScriptContent(projectConfig: ProjectConfig): {
    success: boolean;
    content?: string;
    error?: string;
    details?: {
      tablesProcessed: number;
      tableNames: string[];
      databaseType: string;
    };
  } {
    try {
      if (!projectConfig.database) {
        return {
          success: false,
          error: "No database configuration found in project",
        };
      }

      const schema = DatabaseUtils.convertProjectDefinitionToSchema(
        projectConfig.database
      );

      const validationErrors = DatabaseAction.validateSchema(schema);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join("\n"),
        };
      }

      const sqlScript = DatabaseAction.generateDatabaseScripts(schema, {
        includeDropStatements: true,
        includeComments: true,
        includeAuditColumns: true,
      });

      return {
        success: true,
        content: sqlScript,
        details: {
          tablesProcessed: schema.tables.length,
          tableNames: schema.tables.map((t) => t.name),
          databaseType: schema.type,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get the list of supported database types
   */
  public static getSupportedDatabaseTypes(): string[] {
    return DatabaseAction.getSupportedDatabaseTypes().map((type) =>
      type.toString()
    );
  }

  /**
   * Check if a database type is supported
   */
  public static isDatabaseTypeSupported(databaseType: string): boolean {
    try {
      const dbType = databaseType as DatabaseType;
      return DatabaseAction.isDatabaseTypeSupported(dbType);
    } catch {
      return false;
    }
  }

  /**
   * Get default output file path for database scripts
   */
  private static getOutputFilePath(
    projectConfig: ProjectConfig,
    databaseType: DatabaseType,
    outputDir?: string
  ): string {
    const baseDir =
      outputDir ||
      path.join(
        process.cwd(),
        "generated",
        projectConfig.projectFolder,
        "database"
      );
    const fileName = `${projectConfig.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")}_${databaseType.toLowerCase()}_schema.sql`;
    return path.join(baseDir, fileName);
  }

  /**
   * Validate project configuration for database script generation
   */
  public static validateProjectForScriptGeneration(
    projectConfig: ProjectConfig
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if database configuration exists
    if (!projectConfig.database) {
      errors.push("No database configuration found in project");
      return { isValid: false, errors, warnings };
    }

    // Check if database type is supported
    if (!this.isDatabaseTypeSupported(projectConfig.database.type)) {
      errors.push(
        `Database type "${
          projectConfig.database.type
        }" is not supported. Supported types: ${this.getSupportedDatabaseTypes().join(
          ", "
        )}`
      );
    }

    // Check if tables are defined
    if (
      !projectConfig.database.tables ||
      projectConfig.database.tables.length === 0
    ) {
      errors.push("No tables defined in database configuration");
    }

    // Validate each table has at least one field
    if (projectConfig.database.tables) {
      projectConfig.database.tables.forEach((table) => {
        if (!table.fields || table.fields.length === 0) {
          errors.push(`Table "${table.name}" has no fields defined`);
        }
      });
    }

    // Check for proper project folder configuration
    if (
      !projectConfig.projectFolder ||
      projectConfig.projectFolder.trim() === ""
    ) {
      warnings.push("No project folder specified, using current directory");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
