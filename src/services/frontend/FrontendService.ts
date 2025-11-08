/**
 * Frontend Service for handling frontend setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

export class FrontendService {
  /**
   * Execute frontend setup
   * @param stack Frontend configuration from stack
   * @param config Frontend configuration from project definition
   */
  public async execute({
    stack,
    config,
  }: {
    stack: any;
    config?: any;
  }): Promise<void> {
    console.log("\n\n");
    console.log(`🔧 Setting up frontend...`);
    console.log(`Stack frontend:`, stack);
    if (config) {
      console.log(`Project frontend:`, config);
      await this.delay(1000);
      console.log(`✅ Frontend setup completed.`);
    } else {
      throw new Error("No frontend configuration provided.");
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
