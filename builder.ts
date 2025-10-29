/**
 * Builder - A tool that will build a new project
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

class Builder {
  /**
   * Welcome method that displays the initial message
   */
  private welcome(): void {
    console.log("Builder v0.0.0 - Ready to create amazing projects!");
  }

  /**
   * Default method that will be executed when running the builder
   */
  public default(): void {
    this.welcome();
  }
}

// Create an instance and execute the default method
const builder = new Builder();
builder.default();
