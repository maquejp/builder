/**
 * Builder - Main class focused on business logic for project generation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BuilderUI, ScreenManager } from "./ui";
import {
  BaseAction,
  FullProjectGenerator,
  DatabaseScriptGenerator,
  BackendGenerator,
  FrontendGenerator,
  TestGenerator,
} from "./actions";
import { ProjectConfigurationManager } from "./config";

/**
 * Main Builder class focused on business logic
 */
export class Builder {
  private ui!: BuilderUI;
  private screenManager: ScreenManager;
  private menuOptions: string[];
  private actions: BaseAction[] = [];
  private configManager: ProjectConfigurationManager;

  constructor({
    appTitle,
    appSubTitle,
    appDescription,
    menuOptions,
    configManager,
  }: {
    appTitle: string;
    appSubTitle: string;
    appDescription: string;
    menuOptions: string[];
    configManager: ProjectConfigurationManager;
  }) {
    this.menuOptions = menuOptions;
    this.configManager = configManager;
    this.screenManager = new ScreenManager();

    const headerContent = `{center}{bold}${appTitle}{/bold}\n{green-fg}${appSubTitle}{/green-fg}\n{yellow-fg}${appDescription}{/yellow-fg}{/center}`;

    this.ui = new BuilderUI({
      builder: this,
      headerContent: headerContent,
      menuOptions: menuOptions,
    });

    // Initialize actions
    this.initializeActions();
  }

  /**
   * Initialize all action classes
   */
  private initializeActions(): void {
    this.actions = [
      new FullProjectGenerator(this.ui, this.configManager, this.screenManager), // index 0
      new DatabaseScriptGenerator(this.ui, this.configManager), // index 1
      new BackendGenerator(this.ui, this.configManager), // index 2
      new FrontendGenerator(this.ui, this.configManager), // index 3
      new TestGenerator(this.ui, this.configManager), // index 4
    ];
  }

  /**
   * Execute an action based on the selected index
   */
  public action(index: number): void {
    if (index >= 0 && index < this.actions.length) {
      this.actions[index].execute();
    } else {
      // Handle unknown actions
      this.ui.showMessage(
        `You selected:\n\n{bold}{green-fg}${this.menuOptions[index]}{/green-fg}{/bold}\n\nThis feature will be implemented soon!\n\nPress any key to continue...`
      );
    }
  }

  /**
   * Get the screen manager
   */
  public getScreenManager(): ScreenManager {
    return this.screenManager;
  }

  /**
   * Get project information for display in the UI
   */
  public getProjectInfo(): any {
    try {
      if (this.configManager.isConfigurationLoaded()) {
        const metadata = this.configManager.getProjectMetadata();
        const dbConfig = this.configManager.getDatabaseConfig();
        const frontendConfig = this.configManager.getFrontendConfig();
        const backendConfig = this.configManager.getBackendConfig();
        const testingConfig = this.configManager.getTestingConfig();

        return {
          ...metadata,
          database: dbConfig
            ? {
                type: dbConfig.type,
                tablesCount: dbConfig.tables?.length || 0,
                tables:
                  dbConfig.tables?.map((t) => t.name).join(", ") || "None",
              }
            : null,
          frontend: frontendConfig
            ? {
                framework: frontendConfig.framework || "Not specified",
                version: frontendConfig.version || "Not specified",
                routing: frontendConfig.routing || false,
                authentication: frontendConfig.authentication || false,
              }
            : null,
          backend: backendConfig
            ? {
                framework: backendConfig.framework || "Not specified",
                version: backendConfig.version || "Not specified",
                port: backendConfig.port || "Not specified",
                apiPrefix: backendConfig.apiPrefix || "Not specified",
              }
            : null,
          testing: testingConfig
            ? {
                framework: testingConfig.framework || "Not specified",
                coverage: testingConfig.coverage || false,
                e2e: testingConfig.e2e || false,
                unit: testingConfig.unit || false,
              }
            : null,
        };
      } else {
        return {
          name: "No Project Loaded",
          version: "N/A",
          author: "N/A",
          license: "N/A",
          description: "No project configuration has been loaded yet.",
          projectFolder: "N/A",
          database: null,
          frontend: null,
          backend: null,
          testing: null,
        };
      }
    } catch (error) {
      return {
        name: "Error Loading Project",
        version: "N/A",
        author: "N/A",
        license: "N/A",
        description: "An error occurred while loading project information.",
        projectFolder: "N/A",
        database: null,
        frontend: null,
        backend: null,
        testing: null,
      };
    }
  }

  /**
   * Welcome method that renders the UI
   */
  private welcome(): void {
    this.ui.render();
  }

  /**
   * Default method that will be executed when running the builder
   */
  public default(): void {
    // Show the main UI as the first screen in the screen manager
    this.screenManager.showScreen(this.ui, false);
    this.welcome();
  }
}
