"use strict";
/**
 * Builder - Main class focused on business logic for project generation
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
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
