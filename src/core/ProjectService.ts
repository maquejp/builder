/**
 * Project service for handling project operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectConfigurationManager } from "../config";
import * as fs from "fs";
import * as path from "path";

export class ProjectService {
  private configManager: ProjectConfigurationManager;

  constructor() {
    this.configManager = new ProjectConfigurationManager();
  }

  public async loadProjectDefinition(fileName: string) {
    await this.configManager.loadFromFile(fileName);
    return this.configManager.getProjectConfig();
  }

  /**
   * Discovers definition files in the current directory matching the pattern "*definition.json"
   * @returns Array of definition filenames found
   */
  public async discoverDefinitionFiles(): Promise<string[]> {
    try {
      const currentDir = process.cwd();
      const files = await fs.promises.readdir(currentDir);

      return files.filter((file) => file.endsWith("definition.json")).sort(); // Sort alphabetically for consistent ordering
    } catch (error) {
      console.error("Error discovering definition files:", error);
      return [];
    }
  }
}
