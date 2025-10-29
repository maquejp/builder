/**
 * BuilderUI - Terminal UI handler for the Builder application using Blessed
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as blessed from "blessed";
import { Builder } from "../Builder";
import { BaseUI } from "./BaseUI";

/**
 * UI handler for the Builder application using Blessed
 */
export class BuilderUI extends BaseUI {
  private menuBox!: blessed.Widgets.ListElement;
  private instructionsBox!: blessed.Widgets.BoxElement;
  private builder: Builder;
  private menuOptions: string[];
  private currentSelection: number = 0;

  constructor({
    builder,
    title = "Project Builder",
    headerContent = "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}",
    menuOptions = [],
  }: {
    builder: Builder;
    title?: string;
    headerContent?: string;
    menuOptions?: string[];
  }) {
    super({ title, headerContent });
    this.builder = builder;
    this.menuOptions = [...menuOptions, "Exit"];

    this.initialize();
  }

  /**
   * Setup the specific UI components for the main menu
   */
  protected setupSpecificUI(): void {
    const contentArea = this.getContentArea();

    // Main Menu
    this.menuBox = blessed.list({
      parent: contentArea,
      label: " {bold}{white-fg}Project Types{/white-fg}{/bold} ",
      tags: true,
      top: 0,
      left: "center",
      width: "100%",
      height: "100%-3",
      keys: true,
      vi: true,
      mouse: true,
      border: "line",
      scrollbar: {
        ch: " ",
        track: {
          bg: "cyan",
        },
        style: {
          inverse: true,
        },
      },
      style: {
        fg: "white",
        bg: "blue",
        border: {
          fg: "cyan",
        },
        selected: {
          bg: "black",
          fg: "white",
        },
      },
      items: [...this.menuOptions],
    });

    // Instructions box
    this.instructionsBox = blessed.box({
      parent: contentArea,
      bottom: 0,
      left: "center",
      width: "100%",
      height: 3,
      content:
        "{center}Use ↑↓ arrows to navigate, Enter to select, {bold}i{/bold} for project info, q to quit{/center}",
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

    // Focus on the menu
    this.menuBox.focus();
  }

  /**
   * Setup specific event handlers for the main menu
   */
  protected setupSpecificEventHandlers(): void {
    // Show project info on 'i' key
    this.screen.key(["i"], () => {
      this.showProjectInfo();
    });

    // Track selection changes
    this.menuBox.on("select", (item, index) => {
      this.currentSelection = index;
    });

    // Handle menu selection
    this.menuBox.key(["enter", "space"], () => {
      this.handleMenuSelection(this.currentSelection);
    });

    // Handle mouse clicks - this also triggers selection
    this.menuBox.on("action", () => {
      this.handleMenuSelection(this.currentSelection);
    });
  }

  /**
   * Override the base exit handler to use our custom exit method
   */
  protected handleExit(): void {
    this.exit();
  }

  /**
   * Handle menu selection
   */
  private handleMenuSelection(index: number): void {
    if (index === this.menuOptions.length - 1) {
      // Exit option (always the last item)
      this.exit();
      return;
    }

    // Delegate action to Builder
    this.builder.action(index);
  }
  /**
   * Show a message dialog
   */
  public showMessage(content: string): void {
    const msg = blessed.message({
      parent: this.screen,
      top: "center",
      left: "center",
      width: "50%",
      height: "30%",
      label: " {blue-fg}Information{/blue-fg} ",
      tags: true,
      keys: true,
      hidden: true,
      border: "line",
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "blue",
        },
      },
    });

    msg.display(content, 0, () => {
      // Return focus to menu after closing dialog
      this.menuBox.focus();
      this.screen.render();
    });
  }

  /**
   * Show project information dialog
   */
  public showProjectInfo(): void {
    // Request project info from the builder
    const projectInfo = this.builder.getProjectInfo();

    let infoContent =
      `{bold}{cyan-fg}Project Information{/cyan-fg}{/bold}\n\n` +
      `{bold}Name:{/bold} ${projectInfo.name}\n` +
      `{bold}Version:{/bold} ${projectInfo.version}\n` +
      `{bold}Author:{/bold} ${projectInfo.author}\n` +
      `{bold}License:{/bold} ${projectInfo.license}\n` +
      `{bold}Project Folder:{/bold} ${projectInfo.projectFolder}\n\n` +
      `{bold}Description:{/bold}\n${projectInfo.description}\n\n`;

    // Add database information if available
    if (projectInfo.database) {
      infoContent +=
        `{bold}{green-fg}Database Configuration{/green-fg}{/bold}\n` +
        `{bold}Type:{/bold} ${projectInfo.database.type}\n` +
        `{bold}Tables Count:{/bold} ${projectInfo.database.tablesCount}\n` +
        `{bold}Tables:{/bold} ${projectInfo.database.tables}\n\n`;
    } else {
      infoContent += `{bold}{green-fg}Database:{/bold} {red-fg}Not configured{/red-fg}\n\n`;
    }

    // Add frontend information if available
    if (projectInfo.frontend) {
      infoContent +=
        `{bold}{blue-fg}Frontend Configuration{/blue-fg}{/bold}\n` +
        `{bold}Framework:{/bold} ${projectInfo.frontend.framework}\n` +
        `{bold}Version:{/bold} ${projectInfo.frontend.version}\n` +
        `{bold}Routing:{/bold} ${
          projectInfo.frontend.routing ? "Yes" : "No"
        }\n` +
        `{bold}Authentication:{/bold} ${
          projectInfo.frontend.authentication ? "Yes" : "No"
        }\n\n`;
    } else {
      infoContent += `{bold}{blue-fg}Frontend:{/bold} {red-fg}Not configured{/red-fg}\n\n`;
    }

    // Add backend information if available
    if (projectInfo.backend) {
      infoContent +=
        `{bold}{yellow-fg}Backend Configuration{/yellow-fg}{/bold}\n` +
        `{bold}Framework:{/bold} ${projectInfo.backend.framework}\n` +
        `{bold}Version:{/bold} ${projectInfo.backend.version}\n` +
        `{bold}Port:{/bold} ${projectInfo.backend.port}\n` +
        `{bold}API Prefix:{/bold} ${projectInfo.backend.apiPrefix}\n\n`;
    } else {
      infoContent += `{bold}{yellow-fg}Backend:{/bold} {red-fg}Not configured{/red-fg}\n\n`;
    }

    // Add testing information if available
    if (projectInfo.testing) {
      infoContent +=
        `{bold}{magenta-fg}Testing Configuration{/magenta-fg}{/bold}\n` +
        `{bold}Framework:{/bold} ${projectInfo.testing.framework}\n` +
        `{bold}Coverage:{/bold} ${
          projectInfo.testing.coverage ? "Yes" : "No"
        }\n` +
        `{bold}E2E Tests:{/bold} ${projectInfo.testing.e2e ? "Yes" : "No"}\n` +
        `{bold}Unit Tests:{/bold} ${
          projectInfo.testing.unit ? "Yes" : "No"
        }\n\n`;
    } else {
      infoContent += `{bold}{magenta-fg}Testing:{/bold} {red-fg}Not configured{/red-fg}\n\n`;
    }

    infoContent += `{gray-fg}Press Escape or any key to return to the action menu...{/gray-fg}`;

    // Hide background elements temporarily (but keep headerBox visible)
    this.menuBox.hide();
    this.instructionsBox.hide();

    // Create a full-screen overlay that covers the content area
    const infoOverlay = blessed.box({
      parent: this.screen,
      top: 6, // Start below the header
      left: 0,
      width: "100%",
      height: "100%-6", // Fill the remaining space
      content: infoContent,
      label: " {green-fg}Project Information{/green-fg} ",
      tags: true,
      keys: true,
      scrollable: true,
      alwaysScroll: true,
      border: "line",
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "green",
        },
      },
    });

    // Handle key events to close the dialog
    const closeDialog = () => {
      // Remove the overlay
      this.screen.remove(infoOverlay);

      // Show background elements again (headerBox is already visible)
      this.menuBox.show();
      this.instructionsBox.show();

      // Return focus and render
      this.menuBox.focus();
      this.screen.render();
    };

    // Close on various key combinations
    infoOverlay.key(["escape", "enter", "space", "q", "C-c"], closeDialog);

    // Also close on any other key press
    infoOverlay.on("keypress", (ch, key) => {
      closeDialog();
    });

    // Focus the overlay and render
    infoOverlay.focus();
    this.screen.render();
  }

  /**
   * Update the welcome box content
   */
  public updateWelcomeContent(content: string): void {
    this.updateHeaderContent(content);
  }

  /**
   * Exit the application gracefully
   */
  public exit(): void {
    this.screen.destroy();
    process.exit(0);
  }
}
