/**
 * Oracle View Generator for handling Oracle database views
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseTable,
  ProjectMetadata,
  DatabaseField,
} from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Generates Oracle view scripts (CREATE VIEW statements)
 */
export class OracleViewGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate complete view script for standalone file
   */
  public generateViewScript(table: DatabaseTable): string {
    const viewName = `${table.name.toLowerCase()}_v`;
    const tableName = table.name.toLowerCase();

    // Generate header
    const scriptHeader = DatabaseHelper.generateScriptHeader(
      viewName,
      "ORACLE VIEW",
      {
        includeHeaders: true,
        sectionSeparators: true,
        indentSize: 3,
        includeTimestamps: true,
        includeLineNumbers: false,
      },
      this.projectMetadata
    );

    // Generate view creation
    const createViewScript = this.createViewStatement(
      table,
      viewName,
      tableName
    );

    // Generate view comments
    const viewComments = this.createViewComments(table, viewName);

    // Generate footer
    const scriptFooter = DatabaseHelper.generateScriptFooter(viewName);

    // Combine all sections
    const sections = [
      scriptHeader,
      createViewScript,
      viewComments,
      scriptFooter,
    ].filter((section) => section && section.trim().length > 0);

    return sections.join("\n\n");
  }

  /**
   * Generate view section with header (for inline table scripts)
   */
  public generate(table: DatabaseTable): string | null {
    // For now, return null as views will be generated as separate files
    // This could be used in the future for inline views within table scripts
    return null;
  }

  /**
   * Get the section name for views
   */
  public getSectionName(): string {
    return "TABLE VIEWS";
  }

  /**
   * Get the section description for views
   */
  public getSectionDescription(): string {
    return "Views and virtual tables based on the main table";
  }

  /**
   * Create the CREATE OR REPLACE VIEW statement
   */
  private createViewStatement(
    table: DatabaseTable,
    viewName: string,
    tableName: string
  ): string {
    const columns = this.generateViewColumns(table.fields);
    const selectColumns = this.generateSelectColumns(table.fields);

    return `CREATE OR REPLACE VIEW ${viewName} (
${columns}
) AS
   SELECT ${selectColumns}
     FROM ${tableName};`;
  }

  /**
   * Generate view column definitions for the CREATE VIEW statement
   */
  private generateViewColumns(fields: DatabaseField[]): string {
    return fields.map((field) => `   ${field.name.toLowerCase()}`).join(",\n");
  }

  /**
   * Generate SELECT column expressions with special handling for timestamps
   */
  private generateSelectColumns(fields: DatabaseField[]): string {
    const selectExpressions = fields.map((field, index) => {
      const fieldName = field.name.toLowerCase();
      const indentation = index === 0 ? "" : "          "; // First column has no extra indentation

      // Special handling for timestamp fields - convert to readable format
      if (
        field.type.toLowerCase().includes("timestamp") ||
        fieldName.includes("_on") ||
        fieldName.includes("_at") ||
        field.type.toLowerCase() === "date"
      ) {
        return `${indentation}TO_CHAR(
             ${fieldName},
             'YYYY-MM-DD HH24:MI:SS'
          ) AS ${fieldName}`;
      }

      // Regular fields
      return `${indentation}${fieldName}`;
    });

    return selectExpressions.join(",\n");
  }

  /**
   * Create comments for the view and its columns
   */
  private createViewComments(table: DatabaseTable, viewName: string): string {
    const comments: string[] = [];

    // Table comment
    const tableComment = `View for ${table.name.toLowerCase()} table with formatted columns for display purposes`;

    comments.push(`COMMENT ON TABLE ${viewName} IS
   '${tableComment}';`);

    // Column comments
    table.fields.forEach((field) => {
      const fieldComment =
        field.comment ||
        `${field.name} field from ${table.name.toLowerCase()} table`;
      comments.push(`COMMENT ON COLUMN ${viewName}.${field.name.toLowerCase()} IS
   '${fieldComment}';`);
    });

    return comments.join("\n");
  }
}
