/**
 * Database script generation service
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseAction,
  DatabaseUtils,
  DatabaseType,
  PackageGenerationOptions,
} from "../actions/database";
import { ProjectConfig } from "../config/types";
import * as fs from "fs";
import * as path from "path";

export interface ScriptGenerationResult {
  success: boolean;
  message: string;
  filePath?: string;
  packageFilePath?: string;
  error?: string;
  details?: {
    tablesProcessed: number;
    tableNames: string[];
    scriptLength: number;
    packageLength?: number;
    packagesGenerated?: number;
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

      let packageFilePath: string | undefined;
      let packageLength = 0;
      let packagesGenerated = 0;

      // Generate Oracle packages if database type is Oracle
      if (schema.type === DatabaseType.ORACLE) {
        const packageResult = await this.generateOraclePackages(
          schema.tables,
          projectConfig,
          outputDir
        );

        if (packageResult.success) {
          packageFilePath = packageResult.filePath;
          packageLength = packageResult.packageLength || 0;
          packagesGenerated = packageResult.packagesGenerated || 0;
        }
      }

      return {
        success: true,
        message: packageFilePath
          ? "Database scripts and packages generated successfully"
          : "Database scripts generated successfully",
        filePath: outputPath,
        packageFilePath,
        details: {
          tablesProcessed: schema.tables.length,
          tableNames: schema.tables.map((t) => t.name),
          scriptLength: sqlScript.length,
          packageLength,
          packagesGenerated,
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

  /**
   * Generate Oracle CRUD packages for all tables
   */
  private static async generateOraclePackages(
    tables: any[],
    projectConfig: ProjectConfig,
    outputDir?: string
  ): Promise<{
    success: boolean;
    filePath?: string;
    packageLength?: number;
    packagesGenerated?: number;
    error?: string;
  }> {
    try {
      const packageOptions: PackageGenerationOptions = {
        includeValidation: true,
        includeExceptionHandling: true,
        includeJsonSupport: true,
        includePagination: true,
        includeSearch: true,
        packagePrefix: "pkg_",
        utilityPackage: "p_utilities",
      };

      const packageScripts: string[] = [];
      let packagesGenerated = 0;

      // Generate package for each table
      for (const table of tables) {
        try {
          const packageSQL = DatabaseAction.generateOraclePackage(
            table,
            packageOptions
          );
          packageScripts.push(`-- ========================================`);
          packageScripts.push(`-- CRUD Package for table: ${table.name}`);
          packageScripts.push(`-- ========================================`);
          packageScripts.push("");
          packageScripts.push(packageSQL);
          packageScripts.push("");
          packagesGenerated++;
        } catch (error) {
          console.warn(
            `Failed to generate package for table ${table.name}:`,
            error
          );
          // Continue with other tables even if one fails
        }
      }

      if (packageScripts.length === 0) {
        return {
          success: false,
          error: "No packages could be generated",
        };
      }

      // Create the combined package script
      const header = [
        "-- Oracle CRUD Packages generated by StackCraft",
        `-- Generated on: ${new Date().toISOString().split("T")[0]}`,
        `-- Project: ${projectConfig.name}`,
        `-- Packages generated: ${packagesGenerated}`,
        "-- ========================================",
        "",
        "-- IMPORTANT: These packages depend on a utility package 'p_utilities'",
        "-- You MUST create the utility package before running these CRUD packages.",
        "-- A template for p_utilities is available in the samples folder:",
        "-- - p_utilities_template.sql",
        "--",
        "-- The utility package provides the following required functions:",
        "-- - build_response(status, message, data, http_status) -> CLOB",
        "-- - build_paginated_response(...) -> CLOB",
        "-- - validate_pagination_parameters(...) -> void",
        "-- - validate_sorting_parameters(...) -> void",
        "-- - build_where_clause(...) -> VARCHAR2",
        "--",
        "-- USAGE INSTRUCTIONS:",
        "-- 1. First, run the schema creation script (creates tables, constraints, triggers)",
        "-- 2. Then, create the p_utilities package using the template",
        "-- 3. Finally, run this CRUD packages script",
        "-- 4. Test the packages using the generated functions",
        "--",
        "-- EXAMPLE USAGE:",
        "-- SELECT pkg_table1.create_record('Description', 123, ...) FROM dual;",
        "-- SELECT pkg_table1.get_records(1, 20, 'pk', 'ASC', 'search term') FROM dual;",
        "",
      ].join("\n");

      const fullPackageScript = header + packageScripts.join("\n");

      // Determine output file path for packages
      const packagePath = this.getPackageOutputFilePath(
        projectConfig,
        outputDir
      );

      // Create output directory if it doesn't exist
      const packageDirectory = path.dirname(packagePath);
      if (!fs.existsSync(packageDirectory)) {
        fs.mkdirSync(packageDirectory, { recursive: true });
      }

      // Write package script to file
      fs.writeFileSync(packagePath, fullPackageScript, "utf8");

      // Copy utility template to the output directory
      try {
        const utilityTemplatePath = path.join(
          __dirname,
          "../actions/database/samples/p_utilities_template.sql"
        );
        const utilityOutputPath = path.join(
          packageDirectory,
          "p_utilities_template.sql"
        );

        if (fs.existsSync(utilityTemplatePath)) {
          fs.copyFileSync(utilityTemplatePath, utilityOutputPath);
        }
      } catch (error) {
        console.warn("Failed to copy utility template:", error);
        // Don't fail the whole process if template copy fails
      }

      return {
        success: true,
        filePath: packagePath,
        packageLength: fullPackageScript.length,
        packagesGenerated,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error generating packages",
      };
    }
  }

  /**
   * Get output file path for Oracle packages
   */
  private static getPackageOutputFilePath(
    projectConfig: ProjectConfig,
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
      .replace(/[^a-z0-9]/g, "_")}_oracle_packages.sql`;
    return path.join(baseDir, fileName);
  }
}
