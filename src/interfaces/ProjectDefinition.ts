/**
 * Project Definition interfaces based on the schema
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseType, DatabaseConfiguration } from "./database";
import { BackendConfiguration } from "./backend";
import { FrontendConfiguration } from "./frontend";

// Technology stack definition interface
export interface TechnologyStack {
  database: {
    type: DatabaseType;
    version?: string;
  };
  backend: {
    type: string;
    framework: string;
  };
  frontend: {
    type: string;
    framework: string;
  };
}

// Project metadata interface for services that need minimal project info
export interface ProjectMetadata {
  author: string;
  license: string;
}

// Domain context interface for data generation services
export interface DomainContext {
  name: string;
  description?: string;
}

// Main project definition interface
export interface ProjectDefinition {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  projectFolder: string;
  stack: TechnologyStack;
  database?: DatabaseConfiguration;
  backend?: BackendConfiguration;
  frontend?: FrontendConfiguration;
}
