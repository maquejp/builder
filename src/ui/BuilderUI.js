"use strict";
/**
 * BuilderUI - Terminal UI handler for the Builder application using Blessed
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderUI = void 0;
var blessed = require("blessed");
/**
 * UI handler for the Builder application using Blessed
 */
var BuilderUI = /** @class */ (function () {
    function BuilderUI(_a) {
        var builder = _a.builder, _b = _a.title, title = _b === void 0 ? "Project Builder" : _b, _c = _a.welcomeContent, welcomeContent = _c === void 0 ? "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}" : _c, _d = _a.menuOptions, menuOptions = _d === void 0 ? [] : _d;
        this.currentSelection = 0;
        this.builder = builder;
        this.welcomeContent = welcomeContent;
        this.menuOptions = __spreadArray(__spreadArray([], menuOptions, true), ["Exit"], false);
        this.screen = blessed.screen({
            smartCSR: true,
            title: title,
        });
        this.setupUI();
        this.setupEventHandlers();
    }
    /**
     * Setup the main UI components
     */
    BuilderUI.prototype.setupUI = function () {
        // Header/Welcome Box
        this.welcomeBox = blessed.box({
            top: 0,
            left: "center",
            width: "80%",
            height: 5,
            content: this.welcomeContent,
            tags: true,
            border: {
                type: "line",
            },
            style: {
                fg: "white",
                bg: "blue",
                border: {
                    fg: "#f0f0f0",
                },
            },
        });
        // Main Menu
        this.menuBox = blessed.list({
            label: " {bold}{white-fg}Project Types{/white-fg}{/bold} ",
            tags: true,
            top: 6,
            left: "center",
            width: "80%",
            height: "70%",
            keys: true,
            vi: true,
            mouse: true,
            border: "line",
            scrollbar: {
                ch: " ",
                track: {
                    bg: "cyan",
                },
                style: {
                    inverse: true,
                },
            },
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "cyan",
                },
                selected: {
                    bg: "blue",
                    fg: "white",
                },
            },
            items: __spreadArray([], this.menuOptions, true),
        });
        // Instructions box
        var instructionsBox = blessed.box({
            bottom: 0,
            left: "center",
            width: "80%",
            height: 3,
            content: "{center}Use ↑↓ arrows to navigate, Enter to select, q to quit{/center}",
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
        // Add all elements to screen
        this.screen.append(this.welcomeBox);
        this.screen.append(this.menuBox);
        this.screen.append(instructionsBox);
        // Focus on the menu
        this.menuBox.focus();
    };
    /**
     * Setup event handlers for user interaction
     */
    BuilderUI.prototype.setupEventHandlers = function () {
        var _this = this;
        // Quit on Escape, q, or Control-C
        this.screen.key(["escape", "q", "C-c"], function () {
            _this.exit();
        });
        // Track selection changes
        this.menuBox.on("select", function (item, index) {
            _this.currentSelection = index;
        });
        // Handle menu selection
        this.menuBox.key(["enter", "space"], function () {
            _this.handleMenuSelection(_this.currentSelection);
        });
        // Handle mouse clicks - this also triggers selection
        this.menuBox.on("action", function () {
            _this.handleMenuSelection(_this.currentSelection);
        });
    };
    /**
     * Handle menu selection
     */
    BuilderUI.prototype.handleMenuSelection = function (index) {
        if (index === this.menuOptions.length - 1) {
            // Exit option (always the last item)
            this.exit();
            return;
        }
        // Delegate action to Builder
        this.builder.action(index);
    };
    /**
     * Show a message dialog
     */
    BuilderUI.prototype.showMessage = function (content) {
        var _this = this;
        var msg = blessed.message({
            parent: this.screen,
            top: "center",
            left: "center",
            width: "50%",
            height: "30%",
            label: " {blue-fg}Information{/blue-fg} ",
            tags: true,
            keys: true,
            hidden: true,
            border: "line",
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "blue",
                },
            },
        });
        msg.display(content, 0, function () {
            // Return focus to menu after closing dialog
            _this.menuBox.focus();
            _this.screen.render();
        });
    };
    /**
     * Render the UI
     */
    BuilderUI.prototype.render = function () {
        this.screen.render();
    };
    /**
     * Update the welcome box content
     */
    BuilderUI.prototype.updateWelcomeContent = function (content) {
        this.welcomeContent = content;
        this.welcomeBox.setContent(content);
        this.screen.render();
    };
    /**
     * Exit the application gracefully
     */
    BuilderUI.prototype.exit = function () {
        this.screen.destroy();
        process.exit(0);
    };
    return BuilderUI;
}());
exports.BuilderUI = BuilderUI;
