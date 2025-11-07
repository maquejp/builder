/**
 * Database Service for handling database setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

export class DatabaseService {
  /**
   * Execute database setup
   * @param stack Database configuration from stack
   * @param config Database configuration from project definition
   */
  public async execute({
    stack,
    config,
  }: {
    stack: any;
    config?: any;
  }): Promise<void> {
    console.log("\n\n");
    console.log(`🔧 Setting up database...`);
    console.log(`Stack database:`, stack);
    if (config) {
      console.log(`Project database:`, config);
      await this.delay(1000);
      console.log(`✅ Database setup completed.`);
    } else {
      throw new Error("No database configuration provided.");
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
