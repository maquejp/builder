/**
 * ScreenManager - Manages transitions between different UI screens
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { BaseUI } from "./BaseUI";

/**
 * Screen Manager to handle transitions between different UI screens
 */
export class ScreenManager {
  private currentScreen: BaseUI | null = null;
  private screenStack: BaseUI[] = [];

  constructor() {}

  /**
   * Show a new screen, hiding the current one
   */
  public showScreen(screen: BaseUI, pushToStack: boolean = true): void {
    // Hide current screen if any
    if (this.currentScreen) {
      if (pushToStack) {
        this.screenStack.push(this.currentScreen);
      } else {
        this.currentScreen.destroy();
      }
    }

    // Show new screen
    this.currentScreen = screen;
    screen.show();
  }

  /**
   * Go back to the previous screen in the stack
   */
  public goBack(): boolean {
    if (this.screenStack.length > 0) {
      // Destroy current screen
      if (this.currentScreen) {
        this.currentScreen.destroy();
      }

      // Pop previous screen from stack
      this.currentScreen = this.screenStack.pop()!;
      this.currentScreen.show();
      return true;
    }
    return false;
  }

  /**
   * Replace the current screen without adding to stack
   */
  public replaceScreen(screen: BaseUI): void {
    this.showScreen(screen, false);
  }

  /**
   * Get the current active screen
   */
  public getCurrentScreen(): BaseUI | null {
    return this.currentScreen;
  }

  /**
   * Check if there are previous screens in the stack
   */
  public hasPreviousScreen(): boolean {
    return this.screenStack.length > 0;
  }

  /**
   * Clear all screens and stack
   */
  public clearAll(): void {
    // Destroy current screen
    if (this.currentScreen) {
      this.currentScreen.destroy();
      this.currentScreen = null;
    }

    // Destroy all screens in stack
    this.screenStack.forEach((screen) => screen.destroy());
    this.screenStack = [];
  }

  /**
   * Exit the application gracefully
   */
  public exit(): void {
    this.clearAll();
    process.exit(0);
  }
}
