"use strict";
/**
 * FrontendGenerator - Action for generating frontend application
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
exports.FrontendGenerator = void 0;
var BaseAction_1 = require("../BaseAction");
/**
 * Frontend Generator Action
 * Handles the generation of Angular frontend application
 */
var FrontendGenerator = /** @class */ (function (_super) {
    __extends(FrontendGenerator, _super);
    function FrontendGenerator(ui, configManager) {
        return _super.call(this, ui, configManager) || this;
    }
    /**
     * Execute the frontend generation
     */
    FrontendGenerator.prototype.execute = function () {
        // For now, show the coming soon message
        this.showComingSoonMessage();
        // TODO: Implement actual frontend generation logic
        // - Generate Angular application structure
        // - Create components and services
        // - Set up routing
        // - Generate forms and validation
        // - Create API service clients
        // - Set up styling and themes
    };
    /**
     * Get the action name
     */
    FrontendGenerator.prototype.getActionName = function () {
        return "Generating Frontend";
    };
    /**
     * Get the action description
     */
    FrontendGenerator.prototype.getActionDescription = function () {
        return "This will create an Angular frontend application.";
    };
    /**
     * Generate Angular application structure
     * @private
     */
    FrontendGenerator.prototype.generateAppStructure = function () {
        // TODO: Implement app structure generation logic
    };
    /**
     * Generate components and services
     * @private
     */
    FrontendGenerator.prototype.generateComponentsAndServices = function () {
        // TODO: Implement components and services generation logic
    };
    /**
     * Generate routing setup
     * @private
     */
    FrontendGenerator.prototype.generateRouting = function () {
        // TODO: Implement routing generation logic
    };
    /**
     * Generate forms and validation
     * @private
     */
    FrontendGenerator.prototype.generateFormsAndValidation = function () {
        // TODO: Implement forms and validation generation logic
    };
    return FrontendGenerator;
}(BaseAction_1.BaseAction));
exports.FrontendGenerator = FrontendGenerator;
