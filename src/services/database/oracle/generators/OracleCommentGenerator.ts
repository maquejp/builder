/**
 * Oracle Comment Generator for handling Oracle database comments
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, ProjectMetadata } from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Generates Oracle comment scripts (COMMENT ON COLUMN statements)
 */
export class OracleCommentGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate comments section with header
   */
  public generate(table: DatabaseTable): string | null {
    const comments = this.generateComments(table);
    if (comments.length === 0) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${comments.join("\n")}`;
  }

  /**
   * Get the section name for comments
   */
  public getSectionName(): string {
    return "DOCUMENTATION & COMMENTS";
  }

  /**
   * Get the section description for comments
   */
  public getSectionDescription(): string {
    return "Field descriptions and documentation";
  }

  /**
   * Generate comment statements for fields that have comments
   */
  private generateComments(table: DatabaseTable): string[] {
    const tableName = table.name.toUpperCase();
    const comments: string[] = [];

    // Add field comments
    table.fields.forEach((field) => {
      if (field.comment) {
        const fieldName = field.name.toUpperCase();
        comments.push(
          `COMMENT ON COLUMN ${tableName}.${fieldName} IS '${field.comment}';`
        );
      }
    });

    return comments;
  }
}
