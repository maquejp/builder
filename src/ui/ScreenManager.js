"use strict";
/**
 * ScreenManager - Manages transitions between different UI screens
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenManager = void 0;
/**
 * Screen Manager to handle transitions between different UI screens
 */
var ScreenManager = /** @class */ (function () {
    function ScreenManager() {
        this.currentScreen = null;
        this.screenStack = [];
    }
    /**
     * Show a new screen, hiding the current one
     */
    ScreenManager.prototype.showScreen = function (screen, pushToStack) {
        if (pushToStack === void 0) { pushToStack = true; }
        // Hide current screen if any
        if (this.currentScreen) {
            if (pushToStack) {
                this.screenStack.push(this.currentScreen);
            }
            else {
                this.currentScreen.destroy();
            }
        }
        // Show new screen
        this.currentScreen = screen;
        screen.show();
    };
    /**
     * Go back to the previous screen in the stack
     */
    ScreenManager.prototype.goBack = function () {
        if (this.screenStack.length > 0) {
            // Destroy current screen
            if (this.currentScreen) {
                this.currentScreen.destroy();
            }
            // Pop previous screen from stack
            this.currentScreen = this.screenStack.pop();
            this.currentScreen.show();
            return true;
        }
        return false;
    };
    /**
     * Replace the current screen without adding to stack
     */
    ScreenManager.prototype.replaceScreen = function (screen) {
        this.showScreen(screen, false);
    };
    /**
     * Get the current active screen
     */
    ScreenManager.prototype.getCurrentScreen = function () {
        return this.currentScreen;
    };
    /**
     * Check if there are previous screens in the stack
     */
    ScreenManager.prototype.hasPreviousScreen = function () {
        return this.screenStack.length > 0;
    };
    /**
     * Clear all screens and stack
     */
    ScreenManager.prototype.clearAll = function () {
        // Destroy current screen
        if (this.currentScreen) {
            this.currentScreen.destroy();
            this.currentScreen = null;
        }
        // Destroy all screens in stack
        this.screenStack.forEach(function (screen) { return screen.destroy(); });
        this.screenStack = [];
    };
    /**
     * Exit the application gracefully
     */
    ScreenManager.prototype.exit = function () {
        this.clearAll();
        process.exit(0);
    };
    return ScreenManager;
}());
exports.ScreenManager = ScreenManager;
