/**
 * BaseUI - Base class for all UI components with common header
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as blessed from "blessed";

/**
 * Base UI class that provides common header functionality
 */
export abstract class BaseUI {
  protected screen: blessed.Widgets.Screen;
  protected headerBox!: blessed.Widgets.BoxElement;
  protected headerContent: string;
  protected contentArea!: blessed.Widgets.BoxElement;

  constructor({
    title = "Project Builder",
    headerContent = "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}",
  }: {
    title?: string;
    headerContent?: string;
  }) {
    this.headerContent = headerContent;
    this.screen = blessed.screen({
      smartCSR: true,
      title: title,
    });

    this.setupCommonUI();
  }

  /**
   * Setup the common UI components (header and content area)
   */
  private setupCommonUI(): void {
    // Common Header Box
    this.headerBox = blessed.box({
      top: 0,
      left: "center",
      width: "100%",
      height: 6,
      content: this.headerContent,
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "blue",
        border: {
          fg: "#eb1212ff",
        },
      },
    });

    // Content area - child classes will populate this
    this.contentArea = blessed.box({
      top: 6,
      left: 0,
      width: "100%",
      height: "100%-6",
      style: {
        fg: "white",
        bg: "black",
      },
    });

    // Add common elements to screen
    this.screen.append(this.headerBox);
    this.screen.append(this.contentArea);

    this.setupCommonEventHandlers();
  }

  /**
   * Setup common event handlers
   */
  private setupCommonEventHandlers(): void {
    // Quit on Escape, q, or Control-C (can be overridden by child classes)
    this.screen.key(["escape", "q", "C-c"], () => {
      this.handleExit();
    });
  }

  /**
   * Handle exit - can be overridden by child classes
   */
  protected handleExit(): void {
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Setup the specific UI components for this screen
   * Must be implemented by child classes
   */
  protected abstract setupSpecificUI(): void;

  /**
   * Setup specific event handlers for this screen
   * Must be implemented by child classes
   */
  protected abstract setupSpecificEventHandlers(): void;

  /**
   * Initialize the UI (call this after construction)
   */
  public initialize(): void {
    this.setupSpecificUI();
    this.setupSpecificEventHandlers();
  }

  /**
   * Update the header content
   */
  public updateHeaderContent(content: string): void {
    this.headerContent = content;
    this.headerBox.setContent(content);
    this.screen.render();
  }

  /**
   * Get the screen instance
   */
  public getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }

  /**
   * Get the content area for child classes to add their components
   */
  protected getContentArea(): blessed.Widgets.BoxElement {
    return this.contentArea;
  }

  /**
   * Render the UI
   */
  public render(): void {
    this.screen.render();
  }

  /**
   * Show the UI
   */
  public show(): void {
    this.render();
  }

  /**
   * Hide the UI
   */
  public hide(): void {
    // Implementation depends on the specific needs
    // For now, this is a placeholder for child classes to override
  }

  /**
   * Destroy the UI
   */
  public destroy(): void {
    this.screen.destroy();
  }
}
