/**
 * Generator Service for handling project generation logic
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as fs from "fs-extra";
import * as path from "path";
import { ProjectDefinition } from "../interfaces";

export class GeneratorService {
  /**
   * Generate project based on configuration
   * @param filePath Path to the project definition file (required)
   */
  public async generate(filePath?: string): Promise<void> {
    if (!filePath) {
      throw new Error("Project definition file path is required");
    }

    // Load and validate the project definition
    const projectDefinition = await this.loadProjectDefinition(filePath);

    console.log(
      `✅ Successfully loaded project definition: ${projectDefinition.name}`
    );

    // For now, just simulate some work
    await this.delay(1000);

    // TODO: Implement actual project generation logic
    console.log(
      `📋 Project: ${projectDefinition.name} v${projectDefinition.version}`
    );
    console.log(`📁 Target folder: ${projectDefinition.projectFolder}`);
    console.log(`💾 Database type: ${projectDefinition.database.type}`);
    console.log(
      `🔧 Backend: ${projectDefinition.stack.backend.type} (${projectDefinition.stack.backend.framework})`
    );
    console.log(
      `🎨 Frontend: ${projectDefinition.stack.frontend.type} (${projectDefinition.stack.frontend.framework})`
    );

    // - Parse project definition ✅
    // - Generate folder structure
    // - Create frontend files
    // - Create backend files
    // - Generate database scripts
  }

  /**
   * Load and validate project definition from file
   * @param filePath Path to the project definition JSON file
   * @returns Parsed and validated project definition
   */
  private async loadProjectDefinition(
    filePath: string
  ): Promise<ProjectDefinition> {
    try {
      // Resolve absolute path
      const absolutePath = path.resolve(filePath);

      // Check if file exists
      if (!(await fs.pathExists(absolutePath))) {
        throw new Error(`Project definition file not found: ${absolutePath}`);
      }

      // Validate file extension is JSON
      const fileExtension = path.extname(absolutePath).toLowerCase();
      if (fileExtension !== ".json") {
        throw new Error(
          `Invalid file type. Expected .json file, got: ${fileExtension}`
        );
      }

      // Read and parse JSON file
      const fileContent = await fs.readFile(absolutePath, "utf8");

      if (!fileContent.trim()) {
        throw new Error("Project definition file is empty");
      }

      let projectDefinition: ProjectDefinition;
      try {
        projectDefinition = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON format in project definition file: ${
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error"
          }`
        );
      }

      // Validate required fields
      this.validateProjectDefinition(projectDefinition, absolutePath);

      return projectDefinition;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to load project definition: ${error}`);
    }
  }

  /**
   * Validate project definition structure
   * @param projectDefinition The parsed project definition
   * @param filePath File path for error reporting
   */
  private validateProjectDefinition(
    projectDefinition: any,
    filePath: string
  ): asserts projectDefinition is ProjectDefinition {
    const errors: string[] = [];

    // Check if it's an object
    if (!projectDefinition || typeof projectDefinition !== "object") {
      throw new Error(
        `Invalid project definition: expected object, got ${typeof projectDefinition}`
      );
    }

    // Required top-level fields
    const requiredFields = [
      "name",
      "version",
      "description",
      "author",
      "license",
      "projectFolder",
      "stack",
      "database",
    ];

    for (const field of requiredFields) {
      if (
        !(field in projectDefinition) ||
        projectDefinition[field] === null ||
        projectDefinition[field] === undefined
      ) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate stack structure
    if (projectDefinition.stack) {
      if (!projectDefinition.stack.database) {
        errors.push("Missing required field: stack.database");
      }

      if (!projectDefinition.stack.backend) {
        errors.push("Missing required field: stack.backend");
      } else {
        if (!projectDefinition.stack.backend.type) {
          errors.push("Missing required field: stack.backend.type");
        }
        if (!projectDefinition.stack.backend.framework) {
          errors.push("Missing required field: stack.backend.framework");
        }
      }

      if (!projectDefinition.stack.frontend) {
        errors.push("Missing required field: stack.frontend");
      } else {
        if (!projectDefinition.stack.frontend.type) {
          errors.push("Missing required field: stack.frontend.type");
        }
        if (!projectDefinition.stack.frontend.framework) {
          errors.push("Missing required field: stack.frontend.framework");
        }
      }
    }

    // Validate database structure
    if (projectDefinition.database) {
      if (!projectDefinition.database.type) {
        errors.push("Missing required field: database.type");
      }
      if (
        !projectDefinition.database.tables ||
        !Array.isArray(projectDefinition.database.tables)
      ) {
        errors.push(
          "Missing or invalid field: database.tables (must be an array)"
        );
      } else if (projectDefinition.database.tables.length === 0) {
        errors.push("Database must have at least one table defined");
      }
    }

    // Validate project folder name (basic validation)
    if (
      projectDefinition.projectFolder &&
      typeof projectDefinition.projectFolder === "string"
    ) {
      const folderPattern = /^[a-zA-Z0-9\-_]+$/;
      if (!folderPattern.test(projectDefinition.projectFolder)) {
        errors.push(
          "Invalid projectFolder: must contain only letters, numbers, hyphens, and underscores"
        );
      }
    }

    // Validate version format (basic semantic versioning check)
    if (
      projectDefinition.version &&
      typeof projectDefinition.version === "string"
    ) {
      const versionPattern =
        /^\d+\.\d+\.\d+(-[a-zA-Z0-9\-\.]+)?(\+[a-zA-Z0-9\-\.]+)?$/;
      if (!versionPattern.test(projectDefinition.version)) {
        errors.push(
          "Invalid version format: must follow semantic versioning (e.g., 1.0.0)"
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Invalid project definition in ${filePath}:\n${errors
          .map((err) => `  - ${err}`)
          .join("\n")}`
      );
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
