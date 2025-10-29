"use strict";
/**
 * ActionScreen - Base class for action-specific screens
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionScreen = void 0;
var blessed = require("blessed");
var BaseUI_1 = require("./BaseUI");
/**
 * Base class for action-specific screens
 */
var ActionScreen = /** @class */ (function (_super) {
    __extends(ActionScreen, _super);
    function ActionScreen(_a) {
        var screenManager = _a.screenManager, actionTitle = _a.actionTitle, actionDescription = _a.actionDescription, _b = _a.title, title = _b === void 0 ? "Project Builder - Action" : _b;
        var _this = this;
        var headerContent = "{center}{bold}".concat(actionTitle, "{/bold}\n{green-fg}").concat(actionDescription, "{/green-fg}\n{yellow-fg}Processing...{/yellow-fg}{/center}");
        _this = _super.call(this, { title: title, headerContent: headerContent }) || this;
        _this.screenManager = screenManager;
        _this.actionTitle = actionTitle;
        _this.actionDescription = actionDescription;
        _this.initialize();
        return _this;
    }
    /**
     * Setup the common action screen UI components
     */
    ActionScreen.prototype.setupSpecificUI = function () {
        var contentArea = this.getContentArea();
        // Status box showing current action status
        this.statusBox = blessed.box({
            parent: contentArea,
            top: 0,
            left: 0,
            width: "100%",
            height: 4,
            label: " {bold}{white-fg}Status{/white-fg}{/bold} ",
            content: "{center}{yellow-fg}Initializing...{/yellow-fg}{/center}",
            tags: true,
            border: {
                type: "line",
            },
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "yellow",
                },
            },
        });
        // Main content area for action-specific content
        this.mainContentBox = blessed.box({
            parent: contentArea,
            top: 4,
            left: 0,
            width: "100%",
            height: "100%-7",
            label: " {bold}{white-fg}Details{/white-fg}{/bold} ",
            tags: true,
            scrollable: true,
            alwaysScroll: true,
            border: {
                type: "line",
            },
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "cyan",
                },
            },
        });
        // Instructions box
        this.instructionsBox = blessed.box({
            parent: contentArea,
            bottom: 0,
            left: 0,
            width: "100%",
            height: 3,
            content: "{center}Press {bold}Esc{/bold} or {bold}q{/bold} to go back to main menu{/center}",
            tags: true,
            border: {
                type: "line",
            },
            style: {
                fg: "yellow",
                border: {
                    fg: "yellow",
                },
            },
        });
        // Setup action-specific content
        this.setupActionContent();
    };
    /**
     * Setup common event handlers for action screens
     */
    ActionScreen.prototype.setupSpecificEventHandlers = function () {
        var _this = this;
        // Override to go back to previous screen instead of exiting
        this.screen.key(["escape", "q"], function () {
            _this.goBack();
        });
        // Don't exit on Control-C, just go back
        this.screen.key(["C-c"], function () {
            _this.goBack();
        });
        // Setup action-specific event handlers
        this.setupActionEventHandlers();
    };
    /**
     * Setup action-specific event handlers (can be overridden by child classes)
     */
    ActionScreen.prototype.setupActionEventHandlers = function () {
        // Default: no additional event handlers
    };
    /**
     * Update the status box content
     */
    ActionScreen.prototype.updateStatus = function (status, color) {
        if (color === void 0) { color = "yellow"; }
        this.statusBox.setContent("{center}{".concat(color, "-fg}").concat(status, "{/").concat(color, "-fg}{/center}"));
        this.render();
    };
    /**
     * Update the main content box
     */
    ActionScreen.prototype.updateMainContent = function (content) {
        this.mainContentBox.setContent(content);
        this.render();
    };
    /**
     * Add content to the main content box (append)
     */
    ActionScreen.prototype.addToMainContent = function (content) {
        var currentContent = this.mainContentBox.getContent();
        this.mainContentBox.setContent(currentContent + content);
        this.render();
    };
    /**
     * Show success status
     */
    ActionScreen.prototype.showSuccess = function (message) {
        this.updateStatus(message, "green");
        this.updateHeaderContent("{center}{bold}".concat(this.actionTitle, "{/bold}\n{green-fg}").concat(this.actionDescription, "{/green-fg}\n{green-fg}\u2713 Completed Successfully{/green-fg}{/center}"));
    };
    /**
     * Show error status
     */
    ActionScreen.prototype.showError = function (message) {
        this.updateStatus(message, "red");
        this.updateHeaderContent("{center}{bold}".concat(this.actionTitle, "{/bold}\n{green-fg}").concat(this.actionDescription, "{/green-fg}\n{red-fg}\u2717 Error Occurred{/red-fg}{/center}"));
    };
    /**
     * Go back to the previous screen using the screen manager
     */
    ActionScreen.prototype.goBack = function () {
        if (!this.screenManager.goBack()) {
            // If no previous screen, exit
            this.screenManager.exit();
        }
    };
    /**
     * Override the base exit handler to use screen manager
     */
    ActionScreen.prototype.handleExit = function () {
        this.goBack();
    };
    return ActionScreen;
}(BaseUI_1.BaseUI));
exports.ActionScreen = ActionScreen;
