/**
 * BuilderUI - Terminal UI handler for the Builder application using Blessed
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as blessed from "blessed";
import { Builder } from "../Builder";

/**
 * UI handler for the Builder application using Blessed
 */
export class BuilderUI {
  private screen: blessed.Widgets.Screen;
  private welcomeBox!: blessed.Widgets.BoxElement;
  private menuBox!: blessed.Widgets.ListElement;
  private builder: Builder;
  private welcomeContent: string;
  private menuOptions: string[];
  private currentSelection: number = 0;

  constructor({
    builder,
    title = "Project Builder",
    welcomeContent = "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}",
    menuOptions = [],
  }: {
    builder: Builder;
    title?: string;
    welcomeContent?: string;
    menuOptions?: string[];
  }) {
    this.builder = builder;
    this.welcomeContent = welcomeContent;
    this.menuOptions = [...menuOptions, "Exit"];
    this.screen = blessed.screen({
      smartCSR: true,
      title: title,
    });

    this.setupUI();
    this.setupEventHandlers();
  }

  /**
   * Setup the main UI components
   */
  private setupUI(): void {
    // Header/Welcome Box
    this.welcomeBox = blessed.box({
      top: 0,
      left: "center",
      width: "80%",
      height: 5,
      content: this.welcomeContent,
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "blue",
        border: {
          fg: "#f0f0f0",
        },
      },
    });

    // Main Menu
    this.menuBox = blessed.list({
      label: " {bold}{white-fg}Project Types{/white-fg}{/bold} ",
      tags: true,
      top: 6,
      left: "center",
      width: "80%",
      height: "70%",
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
        bg: "black",
        border: {
          fg: "cyan",
        },
        selected: {
          bg: "blue",
          fg: "white",
        },
      },
      items: this.menuOptions,
    });

    // Instructions box
    const instructionsBox = blessed.box({
      bottom: 0,
      left: "center",
      width: "80%",
      height: 3,
      content:
        "{center}Use ↑↓ arrows to navigate, Enter to select, q to quit{/center}",
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

    // Add all elements to screen
    this.screen.append(this.welcomeBox);
    this.screen.append(this.menuBox);
    this.screen.append(instructionsBox);

    // Focus on the menu
    this.menuBox.focus();
  }

  /**
   * Setup event handlers for user interaction
   */
  private setupEventHandlers(): void {
    // Quit on Escape, q, or Control-C
    this.screen.key(["escape", "q", "C-c"], () => {
      this.exit();
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
   * Handle menu selection
   */
  private handleMenuSelection(index: number): void {
    if (index === this.menuOptions.length - 1) {
      // Exit option (always the last item)
      this.exit();
      return;
    }

    if (index === 0) {
      // Generate Full project
      this.builder.generateFullProject();
      return;
    }

    // Show a confirmation dialog for other options
    this.showMessage(
      `You selected:\n\n{bold}{green-fg}${this.menuOptions[index]}{/green-fg}{/bold}\n\nThis feature will be implemented soon!\n\nPress any key to continue...`
    );
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
   * Render the UI
   */
  public render(): void {
    this.screen.render();
  }

  /**
   * Update the welcome box content
   */
  public updateWelcomeContent(content: string): void {
    this.welcomeContent = content;
    this.welcomeBox.setContent(content);
    this.screen.render();
  }

  /**
   * Exit the application gracefully
   */
  public exit(): void {
    this.screen.destroy();
    process.exit(0);
  }
}
