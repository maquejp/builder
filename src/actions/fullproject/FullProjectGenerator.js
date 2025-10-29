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
exports.FullProjectGenerator = void 0;
var BaseAction_1 = require("../BaseAction");
var ui_1 = require("../../ui");
/**
 * Full Project Generator Screen
 */
var FullProjectGeneratorScreen = /** @class */ (function (_super) {
    __extends(FullProjectGeneratorScreen, _super);
    function FullProjectGeneratorScreen(screenManager, configManager) {
        var _this = _super.call(this, {
            screenManager: screenManager,
            actionTitle: "Full Project Generator",
            actionDescription: "Creating a complete project with frontend, backend, and database",
            title: "Project Builder - Full Project Generation",
        }) || this;
        _this.configManager = configManager;
        return _this;
    }
    FullProjectGeneratorScreen.prototype.setupActionContent = function () {
        // Start the generation process
        this.startGeneration();
    };
    FullProjectGeneratorScreen.prototype.startGeneration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        this.updateStatus("Initializing project generation...", "yellow");
                        content = "{bold}{cyan-fg}Full Project Generation Process{/cyan-fg}{/bold}\n\n";
                        content += "This will create:\n";
                        content += "• {green-fg}Angular Frontend Application{/green-fg}\n";
                        content += "• {blue-fg}Express.js Backend API{/blue-fg}\n";
                        content += "• {yellow-fg}Database Schema & Scripts{/yellow-fg}\n";
                        content += "• {magenta-fg}Docker Configuration{/magenta-fg}\n";
                        content += "• {cyan-fg}Project Documentation{/cyan-fg}\n\n";
                        this.updateMainContent(content);
                        // Simulate generation steps
                        return [4 /*yield*/, this.simulateStep("Analyzing project configuration...", 1000)];
                    case 1:
                        // Simulate generation steps
                        _a.sent();
                        return [4 /*yield*/, this.simulateStep("Generating database schema...", 1500)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.simulateStep("Creating backend API structure...", 2000)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.simulateStep("Setting up frontend application...", 1800)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.simulateStep("Configuring Docker environment...", 1200)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.simulateStep("Generating documentation...", 800)];
                    case 6:
                        _a.sent();
                        this.showSuccess("Project generation completed successfully!");
                        // Add completion details
                        this.addToMainContent("\n{bold}{green-fg}✓ Generation Complete!{/green-fg}{/bold}\n\n");
                        this.addToMainContent("Generated files:\n");
                        this.addToMainContent("• /frontend/ - Angular application\n");
                        this.addToMainContent("• /backend/ - Express.js API\n");
                        this.addToMainContent("• /database/ - SQL scripts\n");
                        this.addToMainContent("• docker-compose.yml\n");
                        this.addToMainContent("• README.md\n\n");
                        this.addToMainContent("{dim}Press Esc to return to main menu{/dim}");
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        this.showError("Failed to generate project");
                        this.addToMainContent("\n{red-fg}Error: ".concat(error_1, "{/red-fg}\n"));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    FullProjectGeneratorScreen.prototype.simulateStep = function (message, delay) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.updateStatus(message, "yellow");
                this.addToMainContent("{dim}".concat(new Date().toLocaleTimeString(), "{/dim} - ").concat(message, "\n"));
                // Simulate work delay
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
            });
        });
    };
    return FullProjectGeneratorScreen;
}(ui_1.ActionScreen));
/**
 * Full Project Generator Action
 * Handles the generation of a complete project with frontend, backend, and database
 */
var FullProjectGenerator = /** @class */ (function (_super) {
    __extends(FullProjectGenerator, _super);
    function FullProjectGenerator(ui, configManager, screenManager) {
        var _this = _super.call(this, ui, configManager) || this;
        // Create a screen manager if not provided
        _this.screenManager = screenManager || new ui_1.ScreenManager();
        return _this;
    }
    /**
     * Execute the full project generation
     */
    FullProjectGenerator.prototype.execute = function () {
        // Create and show the dedicated action screen
        var actionScreen = new FullProjectGeneratorScreen(this.screenManager, this.configManager);
        this.screenManager.showScreen(actionScreen);
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
