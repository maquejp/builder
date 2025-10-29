"use strict";
/**
 * BaseUI - Base class for all UI components with common header
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUI = void 0;
var blessed = require("blessed");
/**
 * Base UI class that provides common header functionality
 */
var BaseUI = /** @class */ (function () {
    function BaseUI(_a) {
        var _b = _a.title, title = _b === void 0 ? "Project Builder" : _b, _c = _a.headerContent, headerContent = _c === void 0 ? "{center}{bold}Builder v0.0.0{/bold}\n{green-fg}Ready to create amazing projects!{/green-fg}{/center}" : _c;
        this.headerContent = headerContent;
        this.screen = blessed.screen({
            smartCSR: true,
            title: title,
        });
        this.setupCommonUI();
    }
    /**
     * Setup the common UI components (header and content area)
     */
    BaseUI.prototype.setupCommonUI = function () {
        // Common Header Box
        this.headerBox = blessed.box({
            top: 0,
            left: "center",
            width: "100%",
            height: 6,
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
        // Content area - child classes will populate this
        this.contentArea = blessed.box({
            top: 6,
            left: 0,
            width: "100%",
            height: "100%-6",
            style: {
                fg: "white",
                bg: "black",
            },
        });
        // Add common elements to screen
        this.screen.append(this.headerBox);
        this.screen.append(this.contentArea);
        this.setupCommonEventHandlers();
    };
    /**
     * Setup common event handlers
     */
    BaseUI.prototype.setupCommonEventHandlers = function () {
        var _this = this;
        // Quit on Escape, q, or Control-C (can be overridden by child classes)
        this.screen.key(["escape", "q", "C-c"], function () {
            _this.handleExit();
        });
    };
    /**
     * Handle exit - can be overridden by child classes
     */
    BaseUI.prototype.handleExit = function () {
        this.screen.destroy();
        process.exit(0);
    };
    /**
     * Initialize the UI (call this after construction)
     */
    BaseUI.prototype.initialize = function () {
        this.setupSpecificUI();
        this.setupSpecificEventHandlers();
    };
    /**
     * Update the header content
     */
    BaseUI.prototype.updateHeaderContent = function (content) {
        this.headerContent = content;
        this.headerBox.setContent(content);
        this.screen.render();
    };
    /**
     * Get the screen instance
     */
    BaseUI.prototype.getScreen = function () {
        return this.screen;
    };
    /**
     * Get the content area for child classes to add their components
     */
    BaseUI.prototype.getContentArea = function () {
        return this.contentArea;
    };
    /**
     * Render the UI
     */
    BaseUI.prototype.render = function () {
        this.screen.render();
    };
    /**
     * Show the UI
     */
    BaseUI.prototype.show = function () {
        this.render();
    };
    /**
     * Hide the UI
     */
    BaseUI.prototype.hide = function () {
        // Implementation depends on the specific needs
        // For now, this is a placeholder for child classes to override
    };
    /**
     * Destroy the UI
     */
    BaseUI.prototype.destroy = function () {
        this.screen.destroy();
    };
    return BaseUI;
}());
exports.BaseUI = BaseUI;
