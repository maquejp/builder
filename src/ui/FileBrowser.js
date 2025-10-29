"use strict";
/**
 * FileBrowser - TUI file browser for selecting JSON configuration files
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
exports.FileBrowser = void 0;
var blessed = require("blessed");
var fs = require("fs");
var path = require("path");
var BaseUI_1 = require("./BaseUI");
/**
 * TUI File Browser component using Blessed
 */
var FileBrowser = /** @class */ (function (_super) {
    __extends(FileBrowser, _super);
    function FileBrowser(options) {
        var _this = this;
        var headerContent = options.headerContent ||
            "{center}{bold}File Browser{/bold}\n{green-fg}Select a project configuration file{/green-fg}{/center}";
        _this = _super.call(this, {
            title: options.title || "File Browser",
            headerContent: headerContent,
        }) || this;
        _this.currentPath = options.startPath || process.cwd();
        _this.fileExtension = options.fileExtension || ".json";
        _this.filePattern = options.filePattern || "definition.json";
        _this.excludedDirectories = options.excludedDirectories || [
            ".git",
            "node_modules",
            "materials",
            "src",
            "dist",
        ];
        _this.onFileSelected = options.onFileSelected;
        _this.onCancel = options.onCancel || (function () { return process.exit(0); });
        _this.initialize();
        _this.refreshFileList();
        return _this;
    }
    /**
     * Setup the specific UI components for the file browser
     */
    FileBrowser.prototype.setupSpecificUI = function () {
        var contentArea = this.getContentArea();
        // Current path display
        this.pathBox = blessed.box({
            parent: contentArea,
            top: 0,
            left: 0,
            width: "100%",
            height: 3,
            content: "Current Path: ".concat(this.currentPath),
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
        // File list
        this.fileList = blessed.list({
            parent: contentArea,
            label: " {bold}{white-fg}Select a project definition file (*".concat(this.filePattern, "){/white-fg}{/bold} "),
            tags: true,
            top: 3,
            left: 0,
            width: "100%",
            height: "100%-6",
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
        });
        // Instructions box
        this.instructionsBox = blessed.box({
            parent: contentArea,
            bottom: 0,
            left: 0,
            width: "100%",
            height: 3,
            content: "{center}↑↓: Navigate | Enter: Select | Backspace: Go up | q/Esc: Cancel{/center}",
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
        // Focus on the file list
        this.fileList.focus();
    };
    /**
     * Setup specific event handlers for the file browser
     */
    FileBrowser.prototype.setupSpecificEventHandlers = function () {
        var _this = this;
        // Go up directory on backspace
        this.screen.key(["backspace"], function () {
            _this.goUpDirectory();
        });
        // Handle selection
        this.fileList.key(["enter", "space"], function () {
            var selectedIndex = _this.fileList.selected;
            var items = _this.fileList.items;
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                var selectedItem = items[selectedIndex].content;
                _this.handleSelection(selectedItem);
            }
        });
        // Handle mouse clicks
        this.fileList.on("action", function () {
            var selectedIndex = _this.fileList.selected;
            var items = _this.fileList.items;
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                var selectedItem = items[selectedIndex].content;
                _this.handleSelection(selectedItem);
            }
        });
    };
    /**
     * Override the base exit handler to use our custom cancel handler
     */
    FileBrowser.prototype.handleExit = function () {
        this.screen.destroy();
        this.onCancel();
    };
    /**
     * Handle file/directory selection
     */
    FileBrowser.prototype.handleSelection = function (selectedItem) {
        // Remove any blessed formatting tags
        var cleanItem = selectedItem.replace(/{[^}]*}/g, "");
        // Remove icon prefixes (*, +, ↑)
        cleanItem = cleanItem.replace(/^[*+↑]\s*/, "").trim();
        if (cleanItem === "..") {
            this.goUpDirectory();
            return;
        }
        var fullPath = path.join(this.currentPath, cleanItem);
        try {
            var stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                this.currentPath = fullPath;
                this.refreshFileList();
            }
            else if (stats.isFile() && this.isValidJsonFile(cleanItem)) {
                this.screen.destroy();
                this.onFileSelected(fullPath);
            }
        }
        catch (error) {
            this.showError("Error accessing ".concat(fullPath, ": ").concat(error));
        }
    };
    /**
     * Go up one directory
     */
    FileBrowser.prototype.goUpDirectory = function () {
        var parentPath = path.dirname(this.currentPath);
        if (parentPath !== this.currentPath) {
            this.currentPath = parentPath;
            this.refreshFileList();
        }
    };
    /**
     * Refresh the file list based on current path
     */
    FileBrowser.prototype.refreshFileList = function () {
        var _this = this;
        try {
            var items = fs.readdirSync(this.currentPath);
            var fileItems = [];
            // Add parent directory option if not at root
            if (this.currentPath !== path.parse(this.currentPath).root) {
                fileItems.push("{cyan-fg}↑ ..{/cyan-fg}");
            }
            // Sort items: directories first, then files
            var directories_1 = [];
            var files_1 = [];
            items.forEach(function (item) {
                var fullPath = path.join(_this.currentPath, item);
                try {
                    var stats = fs.statSync(fullPath);
                    if (stats.isDirectory() && !_this.isExcludedDirectory(item)) {
                        directories_1.push("{blue-fg}+ ".concat(item, "{/blue-fg}"));
                    }
                    else if (_this.isValidJsonFile(item)) {
                        files_1.push("{green-fg}* ".concat(item, "{/green-fg}"));
                    }
                }
                catch (error) {
                    // Skip items we can't access
                }
            });
            // Add sorted items to the list
            fileItems.push.apply(fileItems, directories_1.sort());
            fileItems.push.apply(fileItems, files_1.sort());
            this.fileList.setItems(fileItems);
            this.updatePathDisplay();
            this.render();
        }
        catch (error) {
            this.showError("Error reading directory ".concat(this.currentPath, ": ").concat(error));
        }
    };
    /**
     * Update the path display
     */
    FileBrowser.prototype.updatePathDisplay = function () {
        this.pathBox.setContent("{center}{bold}Current Path:{/bold} {cyan-fg}".concat(this.currentPath, "{/cyan-fg}{/center}"));
    };
    /**
     * Show an error message
     */
    FileBrowser.prototype.showError = function (message) {
        var _this = this;
        var errorBox = blessed.message({
            parent: this.screen,
            top: "center",
            left: "center",
            width: "60%",
            height: "shrink",
            label: " {red-fg}Error{/red-fg} ",
            tags: true,
            keys: true,
            hidden: true,
            border: "line",
            style: {
                fg: "white",
                bg: "black",
                border: {
                    fg: "red",
                },
            },
        });
        errorBox.display(message, 0, function () {
            _this.fileList.focus();
            _this.render();
        });
    };
    /**
     * Check if a file matches the specified pattern
     */
    FileBrowser.prototype.isValidJsonFile = function (fileName) {
        var lowerFileName = fileName.toLowerCase();
        var hasJsonExtension = lowerFileName.endsWith(this.fileExtension);
        // Check if file matches the specified pattern
        var matchesPattern = lowerFileName.endsWith(this.filePattern.toLowerCase());
        return hasJsonExtension && matchesPattern;
    };
    /**
     * Check if a directory should be excluded from the file browser
     */
    FileBrowser.prototype.isExcludedDirectory = function (dirName) {
        return this.excludedDirectories.includes(dirName);
    };
    return FileBrowser;
}(BaseUI_1.BaseUI));
exports.FileBrowser = FileBrowser;
