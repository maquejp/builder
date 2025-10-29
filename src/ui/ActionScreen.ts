/**
 * ActionScreen - Base class for action-specific screens
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as blessed from "blessed";
import { BaseUI } from "./BaseUI";
import { ScreenManager } from "./ScreenManager";

/**
 * Base class for action-specific screens
 */
export abstract class ActionScreen extends BaseUI {
  protected screenManager: ScreenManager;
  protected actionTitle: string;
  protected actionDescription: string;
  protected statusBox!: blessed.Widgets.BoxElement;
  protected mainContentBox!: blessed.Widgets.BoxElement;
  protected instructionsBox!: blessed.Widgets.BoxElement;

  constructor({
    screenManager,
    actionTitle,
    actionDescription,
    title = "Project Builder - Action",
  }: {
    screenManager: ScreenManager;
    actionTitle: string;
    actionDescription: string;
    title?: string;
  }) {
    const headerContent = `{center}{bold}${actionTitle}{/bold}\n{green-fg}${actionDescription}{/green-fg}\n{yellow-fg}Processing...{/yellow-fg}{/center}`;

    super({ title, headerContent });

    this.screenManager = screenManager;
    this.actionTitle = actionTitle;
    this.actionDescription = actionDescription;

    this.initialize();
  }

  /**
   * Setup the common action screen UI components
   */
  protected setupSpecificUI(): void {
    const contentArea = this.getContentArea();

    // Status box showing current action status
    this.statusBox = blessed.box({
      parent: contentArea,
      top: 0,
      left: 0,
      width: "100%",
      height: 4,
      label: " {bold}{white-fg}Status{/white-fg}{/bold} ",
      content: "{center}{yellow-fg}Initializing...{/yellow-fg}{/center}",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "yellow",
        },
      },
    });

    // Main content area for action-specific content
    this.mainContentBox = blessed.box({
      parent: contentArea,
      top: 4,
      left: 0,
      width: "100%",
      height: "100%-7",
      label: " {bold}{white-fg}Details{/white-fg}{/bold} ",
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "cyan",
        },
      },
    });

    // Instructions box
    this.instructionsBox = blessed.box({
      parent: contentArea,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      content:
        "{center}Press {bold}Esc{/bold} or {bold}q{/bold} to go back to main menu{/center}",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "yellow",
        border: {
          fg: "yellow",
        },
      },
    });

    // Setup action-specific content
    this.setupActionContent();
  }

  /**
   * Setup common event handlers for action screens
   */
  protected setupSpecificEventHandlers(): void {
    // Override to go back to previous screen instead of exiting
    this.screen.key(["escape", "q"], () => {
      this.goBack();
    });

    // Don't exit on Control-C, just go back
    this.screen.key(["C-c"], () => {
      this.goBack();
    });

    // Setup action-specific event handlers
    this.setupActionEventHandlers();
  }

  /**
   * Setup action-specific content (must be implemented by child classes)
   */
  protected abstract setupActionContent(): void;

  /**
   * Setup action-specific event handlers (can be overridden by child classes)
   */
  protected setupActionEventHandlers(): void {
    // Default: no additional event handlers
  }

  /**
   * Update the status box content
   */
  protected updateStatus(status: string, color: string = "yellow"): void {
    this.statusBox.setContent(
      `{center}{${color}-fg}${status}{/${color}-fg}{/center}`
    );
    this.render();
  }

  /**
   * Update the main content box
   */
  protected updateMainContent(content: string): void {
    this.mainContentBox.setContent(content);
    this.render();
  }

  /**
   * Add content to the main content box (append)
   */
  protected addToMainContent(content: string): void {
    const currentContent = this.mainContentBox.getContent();
    this.mainContentBox.setContent(currentContent + content);
    this.render();
  }

  /**
   * Show success status
   */
  protected showSuccess(message: string): void {
    this.updateStatus(message, "green");
    this.updateHeaderContent(
      `{center}{bold}${this.actionTitle}{/bold}\n{green-fg}${this.actionDescription}{/green-fg}\n{green-fg}✓ Completed Successfully{/green-fg}{/center}`
    );
  }

  /**
   * Show error status
   */
  protected showError(message: string): void {
    this.updateStatus(message, "red");
    this.updateHeaderContent(
      `{center}{bold}${this.actionTitle}{/bold}\n{green-fg}${this.actionDescription}{/green-fg}\n{red-fg}✗ Error Occurred{/red-fg}{/center}`
    );
  }

  /**
   * Go back to the previous screen using the screen manager
   */
  protected goBack(): void {
    if (!this.screenManager.goBack()) {
      // If no previous screen, exit
      this.screenManager.exit();
    }
  }

  /**
   * Override the base exit handler to use screen manager
   */
  protected handleExit(): void {
    this.goBack();
  }
}
