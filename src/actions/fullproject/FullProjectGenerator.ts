/**
 * FullProjectGenerator - Action for generating a complete project
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BaseAction } from "../BaseAction";
import { BuilderUI } from "../../ui/BuilderUI";
import { ProjectConfigurationManager } from "../../config";
import { ActionScreen, ScreenManager } from "../../ui";

/**
 * Full Project Generator Screen
 */
class FullProjectGeneratorScreen extends ActionScreen {
  private configManager: ProjectConfigurationManager;

  constructor(
    screenManager: ScreenManager,
    configManager: ProjectConfigurationManager
  ) {
    super({
      screenManager,
      actionTitle: "Full Project Generator",
      actionDescription:
        "Creating a complete project with frontend, backend, and database",
      title: "Project Builder - Full Project Generation",
    });

    this.configManager = configManager;
  }

  protected setupActionContent(): void {
    // Start the generation process
    this.startGeneration();
  }

  private async startGeneration(): Promise<void> {
    try {
      this.updateStatus("Initializing project generation...", "yellow");

      let content =
        "{bold}{cyan-fg}Full Project Generation Process{/cyan-fg}{/bold}\n\n";
      content += "This will create:\n";
      content += "• {green-fg}Angular Frontend Application{/green-fg}\n";
      content += "• {blue-fg}Express.js Backend API{/blue-fg}\n";
      content += "• {yellow-fg}Database Schema & Scripts{/yellow-fg}\n";
      content += "• {magenta-fg}Docker Configuration{/magenta-fg}\n";
      content += "• {cyan-fg}Project Documentation{/cyan-fg}\n\n";

      this.updateMainContent(content);

      // Simulate generation steps
      await this.simulateStep("Analyzing project configuration...", 1000);
      await this.simulateStep("Generating database schema...", 1500);
      await this.simulateStep("Creating backend API structure...", 2000);
      await this.simulateStep("Setting up frontend application...", 1800);
      await this.simulateStep("Configuring Docker environment...", 1200);
      await this.simulateStep("Generating documentation...", 800);

      this.showSuccess("Project generation completed successfully!");

      // Add completion details
      this.addToMainContent(
        "\n{bold}{green-fg}✓ Generation Complete!{/green-fg}{/bold}\n\n"
      );
      this.addToMainContent("Generated files:\n");
      this.addToMainContent("• /frontend/ - Angular application\n");
      this.addToMainContent("• /backend/ - Express.js API\n");
      this.addToMainContent("• /database/ - SQL scripts\n");
      this.addToMainContent("• docker-compose.yml\n");
      this.addToMainContent("• README.md\n\n");
      this.addToMainContent("{dim}Press Esc to return to main menu{/dim}");
    } catch (error) {
      this.showError("Failed to generate project");
      this.addToMainContent(`\n{red-fg}Error: ${error}{/red-fg}\n`);
    }
  }

  private async simulateStep(message: string, delay: number): Promise<void> {
    this.updateStatus(message, "yellow");
    this.addToMainContent(
      `{dim}${new Date().toLocaleTimeString()}{/dim} - ${message}\n`
    );

    // Simulate work delay
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Full Project Generator Action
 * Handles the generation of a complete project with frontend, backend, and database
 */
export class FullProjectGenerator extends BaseAction {
  private screenManager: ScreenManager;

  constructor(
    ui: BuilderUI,
    configManager: ProjectConfigurationManager,
    screenManager?: ScreenManager
  ) {
    super(ui, configManager);
    // Create a screen manager if not provided
    this.screenManager = screenManager || new ScreenManager();
  }

  /**
   * Execute the full project generation
   */
  public execute(): void {
    // Create and show the dedicated action screen
    const actionScreen = new FullProjectGeneratorScreen(
      this.screenManager,
      this.configManager
    );
    this.screenManager.showScreen(actionScreen);
  }

  /**
   * Get the action name
   */
  public getActionName(): string {
    return "Generating Full Project";
  }

  /**
   * Get the action description
   */
  public getActionDescription(): string {
    return (
      "This will create:\n" +
      "• Angular Frontend\n" +
      "• Express.js Backend\n" +
      "• Database Schema"
    );
  }
}
