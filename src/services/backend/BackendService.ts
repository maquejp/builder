/**
 * Backend Service for handling backend setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

export class BackendService {
  /**
   * Execute backend setup
   * @param stack Backend configuration from stack
   * @param backend Backend configuration from project definition
   */
  public async execute({
    stack,
    config,
    metadata,
  }: {
    stack: any;
    config?: any;
    metadata?: any;
  }): Promise<void> {
    console.log("\n\n");
    console.log(`🔧 Setting up backend...`);
    console.log(`Stack backend:`, stack);
    if (config) {
      console.log(`Project backend:`, config);
      await this.delay(1000);
      console.log(`✅ Backend setup completed.`);
    } else {
      throw new Error("No backend configuration provided.");
    }
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
