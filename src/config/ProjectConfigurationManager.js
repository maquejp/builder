"use strict";
/**
 * ProjectConfigurationManager - Manages project configuration loading and access
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfigurationManager = void 0;
var fs = require("fs");
var path = require("path");
/**
 * Configuration manager for project configuration
 * Handles loading, parsing, validation, and providing access to configuration data
 */
var ProjectConfigurationManager = /** @class */ (function () {
    function ProjectConfigurationManager() {
        this.config = null;
        this.configFilePath = null;
        // Constructor can be empty as configuration is loaded on demand
    }
    /**
     * Load configuration from a JSON file
     * @param filePath Path to the configuration JSON file
     */
    ProjectConfigurationManager.prototype.loadFromFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var absolutePath, fileContent, parsedConfig, validation;
            return __generator(this, function (_a) {
                try {
                    absolutePath = path.resolve(filePath);
                    if (!fs.existsSync(absolutePath)) {
                        throw new Error("Configuration file not found: ".concat(absolutePath));
                    }
                    fileContent = fs.readFileSync(absolutePath, "utf-8");
                    parsedConfig = JSON.parse(fileContent);
                    validation = this.validateConfiguration(parsedConfig);
                    if (!validation.isValid) {
                        throw new Error("Configuration validation failed:\n".concat(validation.errors.join("\n")));
                    }
                    this.config = parsedConfig;
                    this.configFilePath = absolutePath;
                    // Log warnings if any
                    if (validation.warnings.length > 0) {
                        console.warn("Configuration warnings:", validation.warnings.join("\n"));
                    }
                }
                catch (error) {
                    if (error instanceof Error) {
                        throw new Error("Failed to load configuration: ".concat(error.message));
                    }
                    throw new Error("Failed to load configuration: Unknown error");
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Load configuration from a JSON object
     * @param configObject Configuration object
     */
    ProjectConfigurationManager.prototype.loadFromObject = function (configObject) {
        var validation = this.validateConfiguration(configObject);
        if (!validation.isValid) {
            throw new Error("Configuration validation failed:\n".concat(validation.errors.join("\n")));
        }
        this.config = configObject;
        this.configFilePath = null;
        // Log warnings if any
        if (validation.warnings.length > 0) {
            console.warn("Configuration warnings:", validation.warnings.join("\n"));
        }
    };
    /**
     * Get the full project configuration
     */
    ProjectConfigurationManager.prototype.getProjectConfig = function () {
        this.ensureConfigLoaded();
        return this.config;
    };
    /**
     * Get project metadata
     */
    ProjectConfigurationManager.prototype.getProjectMetadata = function () {
        this.ensureConfigLoaded();
        var config = this.config;
        return {
            name: config.name,
            version: config.version,
            description: config.description,
            author: config.author,
            license: config.license,
            projectFolder: config.projectFolder,
        };
    };
    /**
     * Get database configuration
     */
    ProjectConfigurationManager.prototype.getDatabaseConfig = function () {
        this.ensureConfigLoaded();
        return this.config.database || null;
    };
    /**
     * Get frontend configuration
     */
    ProjectConfigurationManager.prototype.getFrontendConfig = function () {
        this.ensureConfigLoaded();
        return this.config.frontend || null;
    };
    /**
     * Get backend configuration
     */
    ProjectConfigurationManager.prototype.getBackendConfig = function () {
        this.ensureConfigLoaded();
        return this.config.backend || null;
    };
    /**
     * Get testing configuration
     */
    ProjectConfigurationManager.prototype.getTestingConfig = function () {
        this.ensureConfigLoaded();
        return this.config.testing || null;
    };
    /**
     * Get all database tables
     */
    ProjectConfigurationManager.prototype.getDatabaseTables = function () {
        var dbConfig = this.getDatabaseConfig();
        return (dbConfig === null || dbConfig === void 0 ? void 0 : dbConfig.tables) || [];
    };
    /**
     * Get a specific database table by name
     */
    ProjectConfigurationManager.prototype.getDatabaseTable = function (tableName) {
        var tables = this.getDatabaseTables();
        return tables.find(function (table) { return table.name === tableName; }) || null;
    };
    /**
     * Check if configuration is loaded
     */
    ProjectConfigurationManager.prototype.isConfigurationLoaded = function () {
        return this.config !== null;
    };
    /**
     * Get the path of the loaded configuration file
     */
    ProjectConfigurationManager.prototype.getConfigurationFilePath = function () {
        return this.configFilePath;
    };
    /**
     * Validate the project configuration
     */
    ProjectConfigurationManager.prototype.validateConfiguration = function (config) {
        var errors = [];
        var warnings = [];
        // Required fields validation
        if (!config.name || typeof config.name !== "string") {
            errors.push("Project name is required and must be a string");
        }
        if (!config.version || typeof config.version !== "string") {
            errors.push("Project version is required and must be a string");
        }
        if (!config.description || typeof config.description !== "string") {
            errors.push("Project description is required and must be a string");
        }
        if (!config.author || typeof config.author !== "string") {
            errors.push("Project author is required and must be a string");
        }
        if (!config.license || typeof config.license !== "string") {
            errors.push("Project license is required and must be a string");
        }
        if (!config.projectFolder || typeof config.projectFolder !== "string") {
            errors.push("Project folder is required and must be a string");
        }
        // Database configuration validation
        if (config.database) {
            if (!config.database.type || typeof config.database.type !== "string") {
                errors.push("Database type is required when database configuration is present");
            }
            if (!config.database.tables || !Array.isArray(config.database.tables)) {
                errors.push("Database tables must be an array when database configuration is present");
            }
            else {
                // Validate each table
                config.database.tables.forEach(function (table, index) {
                    if (!table.name || typeof table.name !== "string") {
                        errors.push("Table at index ".concat(index, " must have a valid name"));
                    }
                    if (!table.fields || !Array.isArray(table.fields)) {
                        errors.push("Table '".concat(table.name || index, "' must have a fields array"));
                    }
                    else {
                        // Validate each field
                        table.fields.forEach(function (field, fieldIndex) {
                            if (!field.name || typeof field.name !== "string") {
                                errors.push("Field at index ".concat(fieldIndex, " in table '").concat(table.name, "' must have a valid name"));
                            }
                            if (!field.type || typeof field.type !== "string") {
                                errors.push("Field '".concat(field.name, "' in table '").concat(table.name, "' must have a valid type"));
                            }
                            // Validate foreign key reference if present
                            if (field.isForeignKey && !field.foreignKey) {
                                errors.push("Field '".concat(field.name, "' in table '").concat(table.name, "' is marked as foreign key but missing foreignKey configuration"));
                            }
                            if (field.foreignKey) {
                                if (!field.foreignKey.referencedTable ||
                                    !field.foreignKey.referencedColumn) {
                                    errors.push("Foreign key in field '".concat(field.name, "' of table '").concat(table.name, "' must specify referencedTable and referencedColumn"));
                                }
                            }
                        });
                    }
                });
            }
        }
        // Add warnings for optional configurations
        if (!config.frontend) {
            warnings.push("No frontend configuration specified");
        }
        if (!config.backend) {
            warnings.push("No backend configuration specified");
        }
        if (!config.testing) {
            warnings.push("No testing configuration specified");
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
        };
    };
    /**
     * Ensure configuration is loaded, throw error if not
     */
    ProjectConfigurationManager.prototype.ensureConfigLoaded = function () {
        if (!this.config) {
            throw new Error("Configuration not loaded. Please call loadFromFile() or loadFromObject() first.");
        }
    };
    /**
     * Reload configuration from the original file (if loaded from file)
     */
    ProjectConfigurationManager.prototype.reload = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.configFilePath) {
                            throw new Error("Cannot reload configuration: not loaded from file");
                        }
                        return [4 /*yield*/, this.loadFromFile(this.configFilePath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProjectConfigurationManager;
}());
exports.ProjectConfigurationManager = ProjectConfigurationManager;
