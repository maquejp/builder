"use strict";
/**
 * BaseAction - Abstract base class for all builder actions
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAction = void 0;
/**
 * Abstract base class for all builder actions
 */
var BaseAction = /** @class */ (function () {
    function BaseAction(ui, configManager) {
        this.ui = ui;
        this.configManager = configManager;
    }
    /**
     * Show a message using the UI
     */
    BaseAction.prototype.showMessage = function (message) {
        this.ui.showMessage(message);
    };
    /**
     * Show a "coming soon" message with the action details
     */
    BaseAction.prototype.showComingSoonMessage = function () {
        this.showMessage("{bold}{green-fg}".concat(this.getActionName(), "...{/green-fg}{/bold}\n\n") +
            "".concat(this.getActionDescription(), "\n\n") +
            "Feature coming soon!\n\n" +
            "Press any key to continue...");
    };
    return BaseAction;
}());
exports.BaseAction = BaseAction;
