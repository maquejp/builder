/**
 * Oracle Helper utilities for Oracle-specific database operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import {
  DatabaseField,
  ScriptFormatOptions,
  ProjectMetadata,
} from "../../../interfaces";

export class OracleHelper {
  private static defaultFormatOptions: ScriptFormatOptions = {
    includeHeaders: true,
    sectionSeparators: true,
    indentSize: 4,
    includeTimestamps: true,
    includeLineNumbers: false,
  };

  /**
   * Merge format options with defaults
   */
  public static getFormatOptions(
    options?: Partial<ScriptFormatOptions>
  ): ScriptFormatOptions {
    return { ...this.defaultFormatOptions, ...options };
  }

  /**
   * Format individual field definition for Oracle
   */
  public static formatFieldDefinition(field: DatabaseField): string {
    const fieldName = field.name.toUpperCase();
    const fieldType = field.type.toUpperCase();

    let fieldDef = `${fieldName.padEnd(30)} ${fieldType}`;

    // Add nullable constraint
    if (field.nullable === false) {
      fieldDef += " NOT NULL";
    }

    // Add default value
    if (field.default) {
      const defaultValue = this.formatDefaultValue(field.default);
      fieldDef += ` DEFAULT ${defaultValue}`;
    }

    return fieldDef;
  }

  /**
   * Format default values properly for Oracle
   */
  public static formatDefaultValue(defaultValue: string): string {
    const lowerDefault = defaultValue.toLowerCase();

    if (lowerDefault === "systimestamp") {
      return "SYSTIMESTAMP";
    } else if (lowerDefault === "sysdate") {
      return "SYSDATE";
    } else if (lowerDefault === "user") {
      return "USER";
    } else if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
      return defaultValue;
    } else if (/^\d+(\.\d+)?$/.test(defaultValue)) {
      return defaultValue;
    } else {
      return `'${defaultValue}'`;
    }
  }

  /**
   * Validate Oracle script readability and structure
   */
  public static validateScriptReadability(script: string): void {
    const lines = script.split("\n");

    // Check for proper section headers
    const sectionHeaders = lines.filter(
      (line) => line.includes("=".repeat(60)) && line.startsWith("--")
    );

    if (sectionHeaders.length < 2) {
      console.warn(
        chalk.yellow("⚠️  Script may lack proper section organization")
      );
    }

    // Check for consistent indentation
    const indentedLines = lines.filter(
      (line) => line.startsWith("    ") || line.startsWith("\t")
    );

    if (
      indentedLines.length === 0 &&
      lines.some((line) => line.includes("CREATE"))
    ) {
      console.warn(chalk.yellow("⚠️  Script may lack proper indentation"));
    }

    // Validate script structure
    const hasHeader = script.includes("STACKCRAFT ORACLE DATABASE SCRIPT");
    const hasFooter = script.includes("END OF SCRIPT FOR TABLE:");

    if (!hasHeader || !hasFooter) {
      console.warn(chalk.yellow("⚠️  Script may be missing header or footer"));
    }

    console.log(chalk.green("✅ Script readability validation completed"));
  }

  /**
   * Generate Oracle-specific constraint naming conventions
   */
  public static generateConstraintName(
    tableName: string,
    constraintType: "PK" | "FK" | "UK" | "CK",
    fieldName?: string,
    referencedTable?: string
  ): string {
    const upperTableName = tableName.toUpperCase();

    switch (constraintType) {
      case "PK":
        return `${upperTableName}_PK`;
      case "FK":
        return `${upperTableName}_${referencedTable?.toUpperCase()}_FK`;
      case "UK":
        return `${upperTableName}_${fieldName?.toUpperCase()}_UK`;
      case "CK":
        return `${upperTableName}_${fieldName?.toUpperCase()}_CK`;
      default:
        return `${upperTableName}_${constraintType}`;
    }
  }

  /**
   * Generate Oracle trigger naming conventions
   */
  public static generateTriggerName(
    tableName: string,
    timing: "BEFORE" | "AFTER",
    operations: string,
    condition?: string
  ): string {
    const upperTableName = tableName.toUpperCase();

    // Generate proper trigger abbreviation
    let triggerAbbrev = "";
    if (timing === "BEFORE") {
      if (operations.includes("INSERT") && operations.includes("UPDATE")) {
        triggerAbbrev = "BIU"; // Before Insert Update
      } else if (operations.includes("INSERT")) {
        triggerAbbrev = "BI"; // Before Insert
      } else if (operations.includes("UPDATE")) {
        triggerAbbrev = "BU"; // Before Update
      }
    } else if (timing === "AFTER") {
      if (operations.includes("INSERT") && operations.includes("UPDATE")) {
        triggerAbbrev = "AIU"; // After Insert Update
      } else if (operations.includes("INSERT")) {
        triggerAbbrev = "AI"; // After Insert
      } else if (operations.includes("UPDATE")) {
        triggerAbbrev = "AU"; // After Update
      }
    }

    const conditionSuffix = condition ? "_COND" : "";
    return `${upperTableName}_${triggerAbbrev}${conditionSuffix}_TRG`;
  }
}
