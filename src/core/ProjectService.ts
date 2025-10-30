/**
 * Project service for handling project operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectConfigurationManager } from "../config";

export class ProjectService {
  private configManager: ProjectConfigurationManager;

  constructor() {
    this.configManager = new ProjectConfigurationManager();
  }

  public async loadProjectDefinition(fileName: string) {
    await this.configManager.loadFromFile(fileName);
    return this.configManager.getProjectConfig();
  }
}
