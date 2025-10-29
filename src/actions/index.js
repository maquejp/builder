"use strict";
/**
 * Actions - Index file for all builder actions
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGenerator = exports.FrontendGenerator = exports.BackendGenerator = exports.DatabaseScriptGenerator = exports.FullProjectGenerator = exports.BaseAction = void 0;
var BaseAction_1 = require("./BaseAction");
Object.defineProperty(exports, "BaseAction", { enumerable: true, get: function () { return BaseAction_1.BaseAction; } });
var FullProjectGenerator_1 = require("./fullproject/FullProjectGenerator");
Object.defineProperty(exports, "FullProjectGenerator", { enumerable: true, get: function () { return FullProjectGenerator_1.FullProjectGenerator; } });
var DatabaseScriptGenerator_1 = require("./database/DatabaseScriptGenerator");
Object.defineProperty(exports, "DatabaseScriptGenerator", { enumerable: true, get: function () { return DatabaseScriptGenerator_1.DatabaseScriptGenerator; } });
var BackendGenerator_1 = require("./backend/BackendGenerator");
Object.defineProperty(exports, "BackendGenerator", { enumerable: true, get: function () { return BackendGenerator_1.BackendGenerator; } });
var FrontendGenerator_1 = require("./frontend/FrontendGenerator");
Object.defineProperty(exports, "FrontendGenerator", { enumerable: true, get: function () { return FrontendGenerator_1.FrontendGenerator; } });
var TestGenerator_1 = require("./tests/TestGenerator");
Object.defineProperty(exports, "TestGenerator", { enumerable: true, get: function () { return TestGenerator_1.TestGenerator; } });
