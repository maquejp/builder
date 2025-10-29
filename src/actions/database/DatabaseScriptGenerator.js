"use strict";
/**
 * DatabaseScriptGenerator - Action for generating database scripts
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
exports.DatabaseScriptGenerator = void 0;
var BaseAction_1 = require("../BaseAction");
/**
 * Database Script Generator Action
 * Handles the generation of database schema and migration scripts
 */
var DatabaseScriptGenerator = /** @class */ (function (_super) {
    __extends(DatabaseScriptGenerator, _super);
    function DatabaseScriptGenerator(ui, configManager) {
        return _super.call(this, ui, configManager) || this;
    }
    /**
     * Execute the database script generation
     */
    DatabaseScriptGenerator.prototype.execute = function () {
        try {
            // Check if configuration is loaded
            if (!this.configManager.isConfigurationLoaded()) {
                this.showMessage("Error: No project configuration loaded!");
                return;
            }
            // Get database configuration
            var dbConfig = this.configManager.getDatabaseConfig();
            if (!dbConfig) {
                this.showMessage("Error: No database configuration found in project!");
                return;
            }
            // Generate database scripts
            var projectMetadata = this.configManager.getProjectMetadata();
            var createTableScripts = this.generateCreateTableScripts(dbConfig);
            var foreignKeyScripts = this.generateForeignKeyScripts(dbConfig);
            // Show the generated scripts
            var message = "{bold}{green-fg}Database Scripts Generated Successfully!{/green-fg}{/bold}\n\n" +
                "{bold}Project:{/bold} ".concat(projectMetadata.name, "\n") +
                "{bold}Database Type:{/bold} ".concat(dbConfig.type, "\n") +
                "{bold}Tables:{/bold} ".concat(dbConfig.tables.length, "\n\n") +
                "{bold}CREATE TABLE Scripts:{/bold}\n\n" +
                "".concat(createTableScripts, "\n\n") +
                "{bold}ALTER TABLE Scripts (Foreign Keys):{/bold}\n\n" +
                "".concat(foreignKeyScripts, "\n\n") +
                "Press any key to continue...";
            this.showMessage(message);
        }
        catch (error) {
            var errorMessage = error instanceof Error ? error.message : "Unknown error";
            this.showMessage("Error generating database scripts: ".concat(errorMessage, "\n\nPress any key to continue..."));
        }
    };
    /**
     * Get the action name
     */
    DatabaseScriptGenerator.prototype.getActionName = function () {
        return "Generating Database Scripts";
    };
    /**
     * Get the action description
     */
    DatabaseScriptGenerator.prototype.getActionDescription = function () {
        return "This will create database schema and migration scripts.";
    };
    /**
     * Generate CREATE TABLE scripts for all tables
     * @private
     */
    DatabaseScriptGenerator.prototype.generateCreateTableScripts = function (dbConfig) {
        var _this = this;
        return dbConfig.tables
            .map(function (table) { return _this.generateCreateTableScript(table); })
            .join("\n\n");
    };
    /**
     * Generate CREATE TABLE script for a single table
     * @private
     */
    DatabaseScriptGenerator.prototype.generateCreateTableScript = function (table) {
        var tableName = table.name.toUpperCase();
        var fields = table.fields
            .map(function (field) {
            var fieldDef = "  ".concat(field.name.toUpperCase(), " ").concat(field.type.toUpperCase());
            if (!field.nullable) {
                fieldDef += " NOT NULL";
            }
            if (field.default) {
                fieldDef += " DEFAULT ".concat(field.default);
            }
            return fieldDef;
        })
            .join(",\n");
        // Add primary key constraint
        var primaryKeyFields = table.fields
            .filter(function (f) { return f.isPrimaryKey; })
            .map(function (f) { return f.name.toUpperCase(); });
        var constraints = "";
        if (primaryKeyFields.length > 0) {
            constraints = ",\n  CONSTRAINT PK_".concat(tableName, " PRIMARY KEY (").concat(primaryKeyFields.join(", "), ")");
        }
        return "CREATE TABLE ".concat(tableName, " (\n").concat(fields).concat(constraints, "\n);");
    };
    /**
     * Generate ALTER TABLE scripts for foreign key constraints
     * @private
     */
    DatabaseScriptGenerator.prototype.generateForeignKeyScripts = function (dbConfig) {
        var scripts = [];
        dbConfig.tables.forEach(function (table) {
            var foreignKeyFields = table.fields.filter(function (f) { return f.isForeignKey && f.foreignKey; });
            foreignKeyFields.forEach(function (field) {
                if (field.foreignKey) {
                    var constraintName = "FK_".concat(table.name.toUpperCase(), "_").concat(field.foreignKey.referencedTable.toUpperCase());
                    var script = "ALTER TABLE ".concat(table.name.toUpperCase(), " ADD CONSTRAINT ").concat(constraintName, " ") +
                        "FOREIGN KEY (".concat(field.name.toUpperCase(), ") ") +
                        "REFERENCES ".concat(field.foreignKey.referencedTable.toUpperCase(), "(").concat(field.foreignKey.referencedColumn.toUpperCase(), ");");
                    scripts.push(script);
                }
            });
        });
        return scripts.join("\n");
    };
    /**
     * Generate database schema from project models
     * @private
     */
    DatabaseScriptGenerator.prototype.generateSchema = function () {
        // TODO: Implement schema generation logic
    };
    /**
     * Generate migration scripts
     * @private
     */
    DatabaseScriptGenerator.prototype.generateMigrations = function () {
        // TODO: Implement migration generation logic
    };
    /**
     * Generate seed data scripts
     * @private
     */
    DatabaseScriptGenerator.prototype.generateSeedData = function () {
        // TODO: Implement seed data generation logic
    };
    /**
     * Generate database configuration files
     * @private
     */
    DatabaseScriptGenerator.prototype.generateConfig = function () {
        // TODO: Implement config generation logic
    };
    return DatabaseScriptGenerator;
}(BaseAction_1.BaseAction));
exports.DatabaseScriptGenerator = DatabaseScriptGenerator;
