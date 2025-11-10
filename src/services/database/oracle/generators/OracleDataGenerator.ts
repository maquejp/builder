/**
 * Oracle Data Generator for handling Oracle database data population
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseTable,
  ProjectMetadata,
  ProjectDefinition,
} from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";
import { DataGenerationService } from "../../../DataGenerationService";

/**
 * Generates Oracle data population scripts (INSERT statements)
 */
export class OracleDataGenerator extends AbstractScriptGenerator {
  private dataGenerationService: DataGenerationService;

  constructor(
    projectMetadata?: ProjectMetadata,
    projectDefinition?: ProjectDefinition
  ) {
    super(projectMetadata);
    this.dataGenerationService = new DataGenerationService(projectDefinition);
  }

  /**
   * Set the domain context for data generation
   */
  public setDomainContext(domain: string): void {
    this.dataGenerationService.setDomainContext(domain as any);
  }

  /**
   * Generate data population section with header
   */
  public generate(table: DatabaseTable): string | null {
    const dataScript = this.createDataScript(table);
    if (!dataScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${dataScript}`;
  }

  /**
   * Get the section name for data population
   */
  public getSectionName(): string {
    return "INITIAL DATA";
  }

  /**
   * Get the section description for data population
   */
  public getSectionDescription(): string {
    return "Initial data population and seed data";
  }

  /**
   * Create data population script content
   */
  private createDataScript(table: DatabaseTable): string | null {
    const insertStatements: string[] = [];
    const recordCount = 22; // Generate at least 22 records for pagination testing

    // Get primary key field
    const primaryKeyField = table.fields.find((field) => field.isPrimaryKey);
    if (!primaryKeyField) {
      return null; // Skip tables without primary key
    }

    // Generate INSERT statements
    for (let i = 1; i <= recordCount; i++) {
      const fieldValues: string[] = [];
      const fieldNames: string[] = [];

      for (const field of table.fields) {
        // Skip timestamp fields with default values (SYSTIMESTAMP)
        if (field.default === "systimestamp" || field.trigger?.enabled) {
          continue;
        }

        fieldNames.push(field.name);
        fieldValues.push(
          this.dataGenerationService.generateFieldValue(field, i, table.name)
        );
      }

      if (fieldNames.length > 0) {
        const insertStatement = `INSERT INTO ${table.name} (${fieldNames.join(
          ", "
        )}) VALUES (${fieldValues.join(", ")});`;
        insertStatements.push(insertStatement);
      }
    }

    if (insertStatements.length === 0) {
      return null;
    }

    // Add commit statement at the end
    insertStatements.push("COMMIT;");

    return insertStatements.join("\n");
  }
}
