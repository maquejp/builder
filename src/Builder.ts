/**
 * Builder - Main class focused on business logic for project generation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BuilderUI } from "./ui/BuilderUI";

/**
 * Main Builder class focused on business logic
 */
export class Builder {
  private ui!: BuilderUI;
  private menuOptions: string[];

  constructor({
    appTitle,
    appSubTitle,
    appDescription,
    menuOptions,
  }: {
    appTitle: string;
    appSubTitle: string;
    appDescription: string;
    menuOptions: string[];
  }) {
    this.menuOptions = menuOptions;
    const welcomeContent = `{center}{bold}${appTitle}{/bold}\n{green-fg}${appSubTitle}{/green-fg}\n{yellow-fg}${appDescription}{/yellow-fg}{/center}`;

    this.ui = new BuilderUI({
      builder: this,
      welcomeContent: welcomeContent,
      menuOptions: menuOptions,
    });
  }

  /**
   * Generate a full project with frontend, backend, and database
   */
  public action(index: number): void {
    switch (index) {
      case 0:
        this.ui.showMessage(
          "{bold}{green-fg}Generating Full Project...{/green-fg}{/bold}\n\n" +
            "This will create:\n" +
            "• Angular Frontend\n" +
            "• Express.js Backend\n" +
            "• Database Schema\n\n" +
            "Feature coming soon!\n\n" +
            "Press any key to continue..."
        );
        break;
      case 1:
        this.ui.showMessage(
          "{bold}{green-fg}Generating Database Scripts...{/green-fg}{/bold}\n\n" +
            "This will create database schema and migration scripts.\n\n" +
            "Feature coming soon!\n\n" +
            "Press any key to continue..."
        );
        break;
      case 2:
        this.ui.showMessage(
          "{bold}{green-fg}Generating Backend (API)...{/green-fg}{/bold}\n\n" +
            "This will create an Express.js backend with RESTful APIs.\n\n" +
            "Feature coming soon!\n\n" +
            "Press any key to continue..."
        );
        break;
      case 3:
        this.ui.showMessage(
          "{bold}{green-fg}Generating Frontend...{/green-fg}{/bold}\n\n" +
            "This will create an Angular frontend application.\n\n" +
            "Feature coming soon!\n\n" +
            "Press any key to continue..."
        );
        break;
      case 4:
        this.ui.showMessage(
          "{bold}{green-fg}Generating Backend Tests...{/green-fg}{/bold}\n\n" +
            "This will create unit and integration tests for the backend.\n\n" +
            "Feature coming soon!\n\n" +
            "Press any key to continue..."
        );
        break;
      default:
        this.ui.showMessage(
          `You selected:\n\n{bold}{green-fg}${this.menuOptions[index]}{/green-fg}{/bold}\n\nThis feature will be implemented soon!\n\nPress any key to continue...`
        );
        break;
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
