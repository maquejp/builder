"use strict";
/**
 * FullProjectGenerator - Action for generating a complete project
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
exports.FullProjectGenerator = void 0;
var BaseAction_1 = require("../BaseAction");
/**
 * Full Project Generator Action
 * Handles the generation of a complete project with frontend, backend, and database
 */
var FullProjectGenerator = /** @class */ (function (_super) {
    __extends(FullProjectGenerator, _super);
    function FullProjectGenerator(ui) {
        return _super.call(this, ui) || this;
    }
    /**
     * Execute the full project generation
     */
    FullProjectGenerator.prototype.execute = function () {
        // For now, show the coming soon message
        this.showComingSoonMessage();
        // TODO: Implement actual full project generation logic
        // - Generate database scripts
        // - Generate backend API
        // - Generate frontend application
        // - Set up project configuration
        // - Create Docker configurations
        // - Generate documentation
    };
    /**
     * Get the action name
     */
    FullProjectGenerator.prototype.getActionName = function () {
        return "Generating Full Project";
    };
    /**
     * Get the action description
     */
    FullProjectGenerator.prototype.getActionDescription = function () {
        return ("This will create:\n" +
            "• Angular Frontend\n" +
            "• Express.js Backend\n" +
            "• Database Schema");
    };
    return FullProjectGenerator;
}(BaseAction_1.BaseAction));
exports.FullProjectGenerator = FullProjectGenerator;
