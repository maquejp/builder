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
  public generateFullProject(): void {
    this.ui.showMessage(
      "{bold}{green-fg}Generating Full Project...{/green-fg}{/bold}\n\n" +
        "This will create:\n" +
        "• Angular Frontend\n" +
        "• Express.js Backend\n" +
        "• Database Schema\n\n" +
        "Feature coming soon!\n\n" +
        "Press any key to continue..."
    );
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
