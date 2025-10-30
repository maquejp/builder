/**
 * Application state manager
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectConfig } from "../config";

export interface AppMetadata {
  title: string;
  subtitle: string;
  description: string;
}

export class ApplicationState {
  private definitionFileName: string = "my-sample-project-definition.json";
  private projectMetadata: ProjectConfig | null = null;
  private appMetadata: AppMetadata;

  constructor() {
    this.appMetadata = {
      title: 'Builder v0.0.0 - "Untitled Project"',
      subtitle: 'Version: "Unknown" | Author: "Unknown"',
      description: "No description provided.",
    };
  }

  public getDefinitionFileName(): string {
    return this.definitionFileName;
  }

  public setDefinitionFileName(fileName: string): void {
    this.definitionFileName = fileName;
  }

  public getProjectMetadata(): ProjectConfig | null {
    return this.projectMetadata;
  }

  public setProjectMetadata(metadata: ProjectConfig): void {
    this.projectMetadata = metadata;
    this.updateAppMetadata();
  }

  public getAppMetadata(): AppMetadata {
    return this.appMetadata;
  }

  public hasProjectLoaded(): boolean {
    return this.projectMetadata !== null;
  }

  public clearProject(): void {
    this.projectMetadata = null;
    this.resetAppMetadata();
  }

  private updateAppMetadata(): void {
    if (this.projectMetadata) {
      this.appMetadata = {
        title: `Builder v0.0.0 - "${this.projectMetadata.name}"`,
        subtitle: `Version: "${this.projectMetadata.version}" | Author: "${this.projectMetadata.author}"`,
        description: this.projectMetadata.description,
      };
    }
  }

  private resetAppMetadata(): void {
    this.appMetadata = {
      title: 'Builder v0.0.0 - "Untitled Project"',
      subtitle: 'Version: "Unknown" | Author: "Unknown"',
      description: "No description provided.",
    };
  }
}
