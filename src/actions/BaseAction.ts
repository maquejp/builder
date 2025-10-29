/**
 * BaseAction - Abstract base class for all builder actions
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BuilderUI } from "../ui/BuilderUI";
import { ProjectConfigurationManager } from "../config";

/**
 * Abstract base class for all builder actions
 */
export abstract class BaseAction {
  protected ui: BuilderUI;
  protected configManager: ProjectConfigurationManager;

  constructor(ui: BuilderUI, configManager: ProjectConfigurationManager) {
    this.ui = ui;
    this.configManager = configManager;
  }

  /**
   * Execute the action
   */
  public abstract execute(): void;

  /**
   * Get the action name for display purposes
   */
  public abstract getActionName(): string;

  /**
   * Get the action description
   */
  public abstract getActionDescription(): string;

  /**
   * Show a message using the UI
   */
  protected showMessage(message: string): void {
    this.ui.showMessage(message);
  }

  /**
   * Show a "coming soon" message with the action details
   */
  protected showComingSoonMessage(): void {
    this.showMessage(
      `{bold}{green-fg}${this.getActionName()}...{/green-fg}{/bold}\n\n` +
        `${this.getActionDescription()}\n\n` +
        "Feature coming soon!\n\n" +
        "Press any key to continue..."
    );
  }
}
