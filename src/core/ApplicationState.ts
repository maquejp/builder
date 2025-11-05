/**
 * Application state manager
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { ProjectConfig } from "../config";
import * as fs from "fs";
import * as path from "path";

export interface AppMetadata {
  title: string;
  subtitle: string;
  description: string;
}

export class ApplicationState {
  private definitionFileName: string = "project-definition.json";
  private projectMetadata: ProjectConfig | null = null;
  private appMetadata: AppMetadata;
  private appVersion: string;

  constructor() {
    this.appVersion = this.getAppVersion();
    this.appMetadata = {
      title: `Stackcraft v${this.appVersion}`,
      subtitle: "",
      description: "",
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
        title: `Stackcraft v${this.appVersion} `,
        subtitle: `${this.projectMetadata.name} | Version: "${this.projectMetadata.version}" | Author: "${this.projectMetadata.author}"`,
        description: this.projectMetadata.description,
      };
    }
  }

  private resetAppMetadata(): void {
    this.appMetadata = {
      title: `Stackcraft v${this.appVersion}`,
      subtitle: "",
      description: "",
    };
  }

  private getAppVersion(): string {
    try {
      // Find package.json by traversing up from current directory
      let currentDir = __dirname;
      let packageJsonPath = "";

      // Try different possible paths to find package.json
      const possiblePaths = [
        path.resolve(__dirname, "../../../package.json"), // From dist/src/core
        path.resolve(__dirname, "../../package.json"), // From src/core
        path.resolve(process.cwd(), "package.json"), // From project root
      ];

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          packageJsonPath = possiblePath;
          break;
        }
      }

      if (!packageJsonPath) {
        throw new Error("package.json not found");
      }

      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);
      return packageJson.version || "0.0.0";
    } catch (error) {
      console.warn(
        "Could not read version from package.json, using default:",
        error
      );
      return "0.0.0";
    }
  }
}
