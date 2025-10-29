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
        var builder = _a.builder, _b = _a.title, title = _b === void 0 ? "Project Builder" : _b, _c = _a.headerContent, headerContent = _c === void 0 ? "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}" : _c, _d = _a.menuOptions, menuOptions = _d === void 0 ? [] : _d;
        this.currentSelection = 0;
        this.builder = builder;
        this.headerContent = headerContent;
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
        // Header Box
        this.headerBox = blessed.box({
            top: 0,
            left: "center",
            width: "100%",
            height: "70%",
            content: this.headerContent,
            tags: true,
            border: {
                type: "line",
            },
            style: {
                fg: "white",
                bg: "blue",
                border: {
                    fg: "#eb1212ff",
                },
            },
        });
        // Main Menu
        this.menuBox = blessed.list({
            label: " {bold}{white-fg}Project Types{/white-fg}{/bold} ",
            tags: true,
            top: 6,
            left: "center",
            width: "100%",
            height: "100%",
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
                bg: "blue",
                border: {
                    fg: "cyan",
                },
                selected: {
                    bg: "black",
                    fg: "white",
                },
            },
            items: __spreadArray([], this.menuOptions, true),
        });
        // Instructions box
        this.instructionsBox = blessed.box({
            bottom: 0,
            left: "center",
            width: "100%",
            height: 3,
            content: "{center}Use ↑↓ arrows to navigate, Enter to select, {bold}i{/bold} for project info, q to quit{/center}",
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
        this.screen.append(this.headerBox);
        this.screen.append(this.menuBox);
        this.screen.append(this.instructionsBox);
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
        // Show project info on 'i' key
        this.screen.key(["i"], function () {
            _this.showProjectInfo();
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
     * Show project information dialog
     */
    BuilderUI.prototype.showProjectInfo = function () {
        var _this = this;
        // Request project info from the builder
        var projectInfo = this.builder.getProjectInfo();
        var infoContent = "{bold}{cyan-fg}Project Information{/cyan-fg}{/bold}\n\n" +
            "{bold}Name:{/bold} ".concat(projectInfo.name, "\n") +
            "{bold}Version:{/bold} ".concat(projectInfo.version, "\n") +
            "{bold}Author:{/bold} ".concat(projectInfo.author, "\n") +
            "{bold}License:{/bold} ".concat(projectInfo.license, "\n") +
            "{bold}Project Folder:{/bold} ".concat(projectInfo.projectFolder, "\n\n") +
            "{bold}Description:{/bold}\n".concat(projectInfo.description, "\n\n");
        // Add database information if available
        if (projectInfo.database) {
            infoContent +=
                "{bold}{green-fg}Database Configuration{/green-fg}{/bold}\n" +
                    "{bold}Type:{/bold} ".concat(projectInfo.database.type, "\n") +
                    "{bold}Tables Count:{/bold} ".concat(projectInfo.database.tablesCount, "\n") +
                    "{bold}Tables:{/bold} ".concat(projectInfo.database.tables, "\n\n");
        }
        else {
            infoContent += "{bold}{green-fg}Database:{/bold} {red-fg}Not configured{/red-fg}\n\n";
        }
        // Add frontend information if available
        if (projectInfo.frontend) {
            infoContent +=
                "{bold}{blue-fg}Frontend Configuration{/blue-fg}{/bold}\n" +
                    "{bold}Framework:{/bold} ".concat(projectInfo.frontend.framework, "\n") +
                    "{bold}Version:{/bold} ".concat(projectInfo.frontend.version, "\n") +
                    "{bold}Routing:{/bold} ".concat(projectInfo.frontend.routing ? "Yes" : "No", "\n") +
                    "{bold}Authentication:{/bold} ".concat(projectInfo.frontend.authentication ? "Yes" : "No", "\n\n");
        }
        else {
            infoContent += "{bold}{blue-fg}Frontend:{/bold} {red-fg}Not configured{/red-fg}\n\n";
        }
        // Add backend information if available
        if (projectInfo.backend) {
            infoContent +=
                "{bold}{yellow-fg}Backend Configuration{/yellow-fg}{/bold}\n" +
                    "{bold}Framework:{/bold} ".concat(projectInfo.backend.framework, "\n") +
                    "{bold}Version:{/bold} ".concat(projectInfo.backend.version, "\n") +
                    "{bold}Port:{/bold} ".concat(projectInfo.backend.port, "\n") +
                    "{bold}API Prefix:{/bold} ".concat(projectInfo.backend.apiPrefix, "\n\n");
        }
        else {
            infoContent += "{bold}{yellow-fg}Backend:{/bold} {red-fg}Not configured{/red-fg}\n\n";
        }
        // Add testing information if available
        if (projectInfo.testing) {
            infoContent +=
                "{bold}{magenta-fg}Testing Configuration{/magenta-fg}{/bold}\n" +
                    "{bold}Framework:{/bold} ".concat(projectInfo.testing.framework, "\n") +
                    "{bold}Coverage:{/bold} ".concat(projectInfo.testing.coverage ? "Yes" : "No", "\n") +
                    "{bold}E2E Tests:{/bold} ".concat(projectInfo.testing.e2e ? "Yes" : "No", "\n") +
                    "{bold}Unit Tests:{/bold} ".concat(projectInfo.testing.unit ? "Yes" : "No", "\n\n");
        }
        else {
            infoContent += "{bold}{magenta-fg}Testing:{/bold} {red-fg}Not configured{/red-fg}\n\n";
        }
        infoContent += "{gray-fg}Press Escape or any key to return to the action menu...{/gray-fg}";
        // Hide background elements temporarily (but keep headerBox visible)
        this.menuBox.hide();
        this.instructionsBox.hide();
        // Create a full-screen overlay that completely covers everything
        var infoOverlay = blessed.box({
            parent: this.screen,
            top: 0,
            left: 0,
            width: "100%",
            height: "70%",
            content: infoContent,
            label: " {green-fg}Project Information{/green-fg} ",
            tags: true,
            keys: true,
            scrollable: true,
            alwaysScroll: true,
            border: "line",
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "green",
                },
            },
        });
        // Handle key events to close the dialog
        var closeDialog = function () {
            // Remove the overlay
            _this.screen.remove(infoOverlay);
            // Show background elements again (headerBox is already visible)
            _this.menuBox.show();
            _this.instructionsBox.show();
            // Return focus and render
            _this.menuBox.focus();
            _this.screen.render();
        };
        // Close on various key combinations
        infoOverlay.key(["escape", "enter", "space", "q", "C-c"], closeDialog);
        // Also close on any other key press
        infoOverlay.on("keypress", function (ch, key) {
            closeDialog();
        });
        // Focus the overlay and render
        infoOverlay.focus();
        this.screen.render();
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
        this.headerContent = content;
        this.headerBox.setContent(content);
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
