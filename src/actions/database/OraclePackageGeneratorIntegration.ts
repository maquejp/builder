/**
 * Integration example for Oracle Package Generator
 * Shows how the generator integrates with the main StackCraft application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseAction, OraclePackageGenerator } from "./index";
import { DatabaseTable, DatabaseType, PackageGenerationOptions } from "./types";

/**
 * Example integration with StackCraft's main flow
 * This shows how a user would use the Oracle Package Generator
 */
export class OraclePackageGeneratorIntegration {
  /**
   * Generate Oracle package from table definition
   * This would be called from the main StackCraft UI/CLI
   */
  static generatePackageFromDefinition(
    tableName: string,
    fields: any[],
    options: PackageGenerationOptions = {}
  ): {
    success: boolean;
    packageSQL?: string;
    specification?: string;
    body?: string;
    error?: string;
  } {
    try {
      // Convert input to DatabaseTable format
      const table: DatabaseTable = {
        name: tableName,
        fields: fields.map((field) => ({
          name: field.name,
          type: field.type,
          nullable: field.nullable !== false,
          isPrimaryKey: field.isPrimaryKey === true,
          isForeignKey: field.isForeignKey === true,
          isUnique: field.isUnique === true,
          default: field.default,
          comment: field.comment,
          foreignKey: field.foreignKey,
          checkConstraint: field.checkConstraint,
          index: field.index === true,
        })),
      };

      // Generate the complete package
      const packageSQL = DatabaseAction.generateOraclePackage(table, options);

      // Also generate separate components if needed
      const specification = DatabaseAction.generateOraclePackageSpecification(
        table,
        options
      );
      const body = DatabaseAction.generateOraclePackageBody(table, options);

      return {
        success: true,
        packageSQL,
        specification,
        body,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate both table creation scripts and CRUD package
   * Complete database setup in one call
   */
  static generateCompleteOracleSetup(
    tableName: string,
    fields: any[],
    scriptOptions: any = {},
    packageOptions: PackageGenerationOptions = {}
  ): {
    success: boolean;
    tableScript?: string;
    packageSQL?: string;
    error?: string;
  } {
    try {
      // Convert to DatabaseTable format
      const table: DatabaseTable = {
        name: tableName,
        fields: fields.map((field) => ({
          name: field.name,
          type: field.type,
          nullable: field.nullable !== false,
          isPrimaryKey: field.isPrimaryKey === true,
          isForeignKey: field.isForeignKey === true,
          isUnique: field.isUnique === true,
          default: field.default,
          comment: field.comment,
          foreignKey: field.foreignKey,
          checkConstraint: field.checkConstraint,
          index: field.index === true,
        })),
      };

      // Generate table creation script
      const tableScript = DatabaseAction.generateTableScript(
        table,
        DatabaseType.ORACLE,
        scriptOptions
      );

      // Generate CRUD package
      const packageSQL = DatabaseAction.generateOraclePackage(
        table,
        packageOptions
      );

      return {
        success: true,
        tableScript,
        packageSQL,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Validate table definition for package generation
   */
  static validateTableForPackageGeneration(
    tableName: string,
    fields: any[]
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!tableName || tableName.trim() === "") {
      errors.push("Table name is required");
    }

    if (!fields || fields.length === 0) {
      errors.push("At least one field is required");
    }

    // Check for primary key
    const hasPrimaryKey = fields.some((field) => field.isPrimaryKey === true);
    if (!hasPrimaryKey) {
      warnings.push(
        'No primary key defined. A default "pk" column will be added.'
      );
    }

    // Check for audit columns
    const hasCreatedAt = fields.some((field) =>
      field.name.toLowerCase().includes("created_at")
    );
    const hasUpdatedAt = fields.some((field) =>
      field.name.toLowerCase().includes("updated_at")
    );

    if (!hasCreatedAt || !hasUpdatedAt) {
      warnings.push(
        "Audit columns (created_at, updated_at) will be automatically added."
      );
    }

    // Check for searchable fields
    const hasSearchableFields = fields.some((field) => {
      const type = field.type?.toUpperCase() || "";
      return (
        type.includes("VARCHAR") ||
        type.includes("CHAR") ||
        type.includes("CLOB")
      );
    });

    if (!hasSearchableFields) {
      warnings.push(
        "No searchable text fields found. Search functionality will be limited."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate package with different preset configurations
   */
  static generateWithPreset(
    table: DatabaseTable,
    preset: "minimal" | "standard" | "full" | "api"
  ): string {
    let options: PackageGenerationOptions;

    switch (preset) {
      case "minimal":
        options = {
          includeValidation: false,
          includeExceptionHandling: false,
          includeJsonSupport: false,
          includePagination: false,
          includeSearch: false,
          packagePrefix: "simple_",
        };
        break;

      case "standard":
        options = {
          includeValidation: true,
          includeExceptionHandling: true,
          includeJsonSupport: false,
          includePagination: true,
          includeSearch: true,
          packagePrefix: "pkg_",
        };
        break;

      case "full":
        options = {
          includeValidation: true,
          includeExceptionHandling: true,
          includeJsonSupport: true,
          includePagination: true,
          includeSearch: true,
          packagePrefix: "pkg_",
          utilityPackage: "p_utilities",
        };
        break;

      case "api":
        options = {
          includeValidation: true,
          includeExceptionHandling: true,
          includeJsonSupport: true,
          includePagination: true,
          includeSearch: true,
          packagePrefix: "api_",
          utilityPackage: "api_utils",
        };
        break;

      default:
        throw new Error(`Unknown preset: ${preset}`);
    }

    return DatabaseAction.generateOraclePackage(table, options);
  }
}

// Example usage scenarios
export const exampleUsage = {
  // Simple package generation
  generateSimplePackage: () => {
    const result =
      OraclePackageGeneratorIntegration.generatePackageFromDefinition("users", [
        { name: "id", type: "NUMBER", isPrimaryKey: true },
        {
          name: "username",
          type: "VARCHAR2(50)",
          nullable: false,
          isUnique: true,
        },
        { name: "email", type: "VARCHAR2(100)", nullable: false },
        { name: "status", type: "VARCHAR2(10)", default: "'ACTIVE'" },
      ]);

    if (result.success) {
      console.log("Package generated successfully!");
      return result.packageSQL;
    } else {
      console.error("Generation failed:", result.error);
      return null;
    }
  },

  // Complete setup with custom options
  generateCompleteSetup: () => {
    const packageOptions: PackageGenerationOptions = {
      packagePrefix: "crud_",
      utilityPackage: "common_utils",
      includeSearch: true,
    };

    const result =
      OraclePackageGeneratorIntegration.generateCompleteOracleSetup(
        "products",
        [
          { name: "product_id", type: "NUMBER", isPrimaryKey: true },
          { name: "name", type: "VARCHAR2(100)", nullable: false },
          { name: "description", type: "CLOB" },
          { name: "price", type: "NUMBER(10,2)", checkConstraint: "price > 0" },
          {
            name: "category_id",
            type: "NUMBER",
            isForeignKey: true,
            foreignKey: {
              referencedTable: "categories",
              referencedColumn: "id",
            },
          },
        ],
        { includeComments: true },
        packageOptions
      );

    return result;
  },

  // Validation example
  validateExample: () => {
    const validation =
      OraclePackageGeneratorIntegration.validateTableForPackageGeneration(
        "orders",
        [
          { name: "order_date", type: "DATE" },
          { name: "total", type: "NUMBER(10,2)" },
        ]
      );

    console.log("Validation result:", validation);
    return validation;
  },
};
