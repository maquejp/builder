"use strict";
/**
 * BackendGenerator - Action for generating backend API
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
exports.BackendGenerator = void 0;
var BaseAction_1 = require("../BaseAction");
/**
 * Backend Generator Action
 * Handles the generation of Express.js backend with RESTful APIs
 */
var BackendGenerator = /** @class */ (function (_super) {
    __extends(BackendGenerator, _super);
    function BackendGenerator(ui) {
        return _super.call(this, ui) || this;
    }
    /**
     * Execute the backend generation
     */
    BackendGenerator.prototype.execute = function () {
        // For now, show the coming soon message
        this.showComingSoonMessage();
        // TODO: Implement actual backend generation logic
        // - Generate Express.js server setup
        // - Create REST API endpoints
        // - Generate middleware
        // - Set up authentication/authorization
        // - Create database models and repositories
        // - Generate API documentation
    };
    /**
     * Get the action name
     */
    BackendGenerator.prototype.getActionName = function () {
        return "Generating Backend (API)";
    };
    /**
     * Get the action description
     */
    BackendGenerator.prototype.getActionDescription = function () {
        return "This will create an Express.js backend with RESTful APIs.";
    };
    /**
     * Generate Express.js server setup
     * @private
     */
    BackendGenerator.prototype.generateServerSetup = function () {
        // TODO: Implement server setup generation logic
    };
    /**
     * Generate REST API endpoints
     * @private
     */
    BackendGenerator.prototype.generateAPIEndpoints = function () {
        // TODO: Implement API endpoints generation logic
    };
    /**
     * Generate middleware
     * @private
     */
    BackendGenerator.prototype.generateMiddleware = function () {
        // TODO: Implement middleware generation logic
    };
    /**
     * Generate authentication setup
     * @private
     */
    BackendGenerator.prototype.generateAuthentication = function () {
        // TODO: Implement authentication generation logic
    };
    return BackendGenerator;
}(BaseAction_1.BaseAction));
exports.BackendGenerator = BackendGenerator;
