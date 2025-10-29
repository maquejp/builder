"use strict";
/**
 * Builder - Main class focused on business logic for project generation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
var ui_1 = require("./ui");
var actions_1 = require("./actions");
/**
 * Main Builder class focused on business logic
 */
var Builder = /** @class */ (function () {
    function Builder(_a) {
        var appTitle = _a.appTitle, appSubTitle = _a.appSubTitle, appDescription = _a.appDescription, menuOptions = _a.menuOptions, configManager = _a.configManager;
        this.actions = [];
        this.menuOptions = menuOptions;
        this.configManager = configManager;
        var welcomeContent = "{center}{bold}".concat(appTitle, "{/bold}\n{green-fg}").concat(appSubTitle, "{/green-fg}\n{yellow-fg}").concat(appDescription, "{/yellow-fg}{/center}");
        this.ui = new ui_1.BuilderUI({
            builder: this,
            welcomeContent: welcomeContent,
            menuOptions: menuOptions,
        });
        // Initialize actions
        this.initializeActions();
    }
    /**
     * Initialize all action classes
     */
    Builder.prototype.initializeActions = function () {
        this.actions = [
            new actions_1.FullProjectGenerator(this.ui, this.configManager), // index 0
            new actions_1.DatabaseScriptGenerator(this.ui, this.configManager), // index 1
            new actions_1.BackendGenerator(this.ui, this.configManager), // index 2
            new actions_1.FrontendGenerator(this.ui, this.configManager), // index 3
            new actions_1.TestGenerator(this.ui, this.configManager), // index 4
        ];
    };
    /**
     * Execute an action based on the selected index
     */
    Builder.prototype.action = function (index) {
        if (index >= 0 && index < this.actions.length) {
            this.actions[index].execute();
        }
        else {
            // Handle unknown actions
            this.ui.showMessage("You selected:\n\n{bold}{green-fg}".concat(this.menuOptions[index], "{/green-fg}{/bold}\n\nThis feature will be implemented soon!\n\nPress any key to continue..."));
        }
    };
    /**
     * Get project information for display in the UI
     */
    Builder.prototype.getProjectInfo = function () {
        var _a, _b;
        try {
            if (this.configManager.isConfigurationLoaded()) {
                var metadata = this.configManager.getProjectMetadata();
                var dbConfig = this.configManager.getDatabaseConfig();
                var frontendConfig = this.configManager.getFrontendConfig();
                var backendConfig = this.configManager.getBackendConfig();
                var testingConfig = this.configManager.getTestingConfig();
                return __assign(__assign({}, metadata), { database: dbConfig
                        ? {
                            type: dbConfig.type,
                            tablesCount: ((_a = dbConfig.tables) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            tables: ((_b = dbConfig.tables) === null || _b === void 0 ? void 0 : _b.map(function (t) { return t.name; }).join(", ")) || "None",
                        }
                        : null, frontend: frontendConfig
                        ? {
                            framework: frontendConfig.framework || "Not specified",
                            version: frontendConfig.version || "Not specified",
                            routing: frontendConfig.routing || false,
                            authentication: frontendConfig.authentication || false,
                        }
                        : null, backend: backendConfig
                        ? {
                            framework: backendConfig.framework || "Not specified",
                            version: backendConfig.version || "Not specified",
                            port: backendConfig.port || "Not specified",
                            apiPrefix: backendConfig.apiPrefix || "Not specified",
                        }
                        : null, testing: testingConfig
                        ? {
                            framework: testingConfig.framework || "Not specified",
                            coverage: testingConfig.coverage || false,
                            e2e: testingConfig.e2e || false,
                            unit: testingConfig.unit || false,
                        }
                        : null });
            }
            else {
                return {
                    name: "No Project Loaded",
                    version: "N/A",
                    author: "N/A",
                    license: "N/A",
                    description: "No project configuration has been loaded yet.",
                    projectFolder: "N/A",
                    database: null,
                    frontend: null,
                    backend: null,
                    testing: null,
                };
            }
        }
        catch (error) {
            return {
                name: "Error Loading Project",
                version: "N/A",
                author: "N/A",
                license: "N/A",
                description: "An error occurred while loading project information.",
                projectFolder: "N/A",
                database: null,
                frontend: null,
                backend: null,
                testing: null,
            };
        }
    };
    /**
     * Welcome method that renders the UI
     */
    Builder.prototype.welcome = function () {
        this.ui.render();
    };
    /**
     * Default method that will be executed when running the builder
     */
    Builder.prototype.default = function () {
        this.welcome();
    };
    return Builder;
}());
exports.Builder = Builder;
