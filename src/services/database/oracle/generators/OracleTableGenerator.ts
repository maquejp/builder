/**
 * Oracle Table Generator for handling Oracle database table definitions
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, ProjectMetadata } from "../../../../interfaces";
import { DatabaseHelper, OracleHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Generates Oracle table definition scripts (CREATE TABLE statements)
 */
export class OracleTableGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate table definition section with header
   */
  public generate(table: DatabaseTable): string | null {
    const tableName = table.name.toUpperCase();
    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      `Creating table structure for ${tableName}`
    );

    const fieldDefinitions = table.fields.map((field) => {
      return OracleHelper.formatFieldDefinition(field);
    });

    const tableSQL = this.generateCreateTableStatement(
      tableName,
      fieldDefinitions
    );

    return `${sectionHeader}

${tableSQL}`;
  }

  /**
   * Get the section name for table definition
   */
  public getSectionName(): string {
    return "TABLE DEFINITION";
  }

  /**
   * Get the section description for table definition
   */
  public getSectionDescription(): string {
    return "Table structure and field definitions";
  }

  /**
   * Generate the CREATE TABLE SQL statement
   */
  private generateCreateTableStatement(
    tableName: string,
    fieldDefinitions: string[]
  ): string {
    return `CREATE TABLE ${tableName} (
${fieldDefinitions.map((field) => `    ${field}`).join(",\n")}
);`;
  }
}
