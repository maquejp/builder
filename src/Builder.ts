/**
 * Builder - Main class focused on business logic for project generation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BuilderUI } from "./ui/BuilderUI";
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

    const welcomeContent = `{center}{bold}${appTitle}{/bold}\n{green-fg}${appSubTitle}{/green-fg}\n{yellow-fg}${appDescription}{/yellow-fg}{/center}`;

    this.ui = new BuilderUI({
      builder: this,
      welcomeContent: welcomeContent,
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
      new FullProjectGenerator(this.ui, this.configManager), // index 0
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
   * Welcome method that renders the UI
   */
  private welcome(): void {
    this.ui.render();
  }

  /**
   * Default method that will be executed when running the builder
   */
  public default(): void {
    this.welcome();
  }
}
