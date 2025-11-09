/**
 * Base interface for database script generators
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, ProjectMetadata } from "../../../interfaces";

/**
 * Base interface for all database script section generators
 */
export interface BaseScriptGenerator {
  /**
   * Generate the script section for a given table
   * @param table The database table definition
   * @returns The generated script section or null if not applicable
   */
  generate(table: DatabaseTable): string | null;

  /**
   * Get the section name for this generator
   * @returns The section name used in headers
   */
  getSectionName(): string;

  /**
   * Get the section description for this generator
   * @returns The section description used in headers
   */
  getSectionDescription(): string;
}

/**
 * Base abstract class that provides common functionality for generators
 */
export abstract class AbstractScriptGenerator implements BaseScriptGenerator {
  protected projectMetadata: ProjectMetadata | null = null;

  constructor(projectMetadata?: ProjectMetadata) {
    this.projectMetadata = projectMetadata || null;
  }

  /**
   * Update project metadata
   * @param metadata Project metadata for script generation
   */
  public setProjectMetadata(metadata: ProjectMetadata | null): void {
    this.projectMetadata = metadata;
  }

  /**
   * Generate the script section for a given table
   */
  abstract generate(table: DatabaseTable): string | null;

  /**
   * Get the section name for this generator
   */
  abstract getSectionName(): string;

  /**
   * Get the section description for this generator
   */
  abstract getSectionDescription(): string;
}
