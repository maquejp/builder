/**
 * Project Definition Service for handling project definition loading and validation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as fs from "fs-extra";
import * as path from "path";
import { ProjectDefinition } from "../interfaces";

export class ProjectDefinitionService {
  /**
   * Load and validate project definition from file
   * @param filePath Path to the project definition JSON file
   * @returns Parsed and validated project definition
   */
  public async loadProjectDefinition({
    filePath,
  }: {
    filePath: string;
  }): Promise<ProjectDefinition> {
    console.log("⏳ Loading project definition...");

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
  public validateProjectDefinition(
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
      // Validate stack.database (required)
      if (!projectDefinition.stack.database) {
        errors.push("Missing required field: stack.database");
      } else {
        if (!projectDefinition.stack.database.type) {
          errors.push("Missing required field: stack.database.type");
        }
        if (!projectDefinition.stack.database.version) {
          errors.push("Missing required field: stack.database.version");
        }
      }

      // Validate stack.backend (required)
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

      // Validate stack.frontend (required)
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

    // Validate database structure (optional)
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

    // Validate backend structure (optional)
    if (projectDefinition.backend) {
      if (!projectDefinition.backend.type) {
        errors.push("Missing required field: backend.type");
      }
      if (!projectDefinition.backend.framework) {
        errors.push("Missing required field: backend.framework");
      }
    }

    // Validate frontend structure (optional)
    if (projectDefinition.frontend) {
      if (!projectDefinition.frontend.type) {
        errors.push("Missing required field: frontend.type");
      }
      if (!projectDefinition.frontend.framework) {
        errors.push("Missing required field: frontend.framework");
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
}
