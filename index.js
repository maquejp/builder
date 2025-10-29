"use strict";
/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Builder_1 = require("./src/Builder");
// Create an instance and execute the default method
var builder = new Builder_1.Builder({
    appTitle: "Builder v0.0.0",
    appSubTitle: "Welcome to the Project Builder!",
    appDescription: "Create amazing projects with ease",
    menuOptions: [
        "Generate Full project",
        "Generate Database Scripts",
        "Generate Backend (API)",
        "Generate Frontend",
        "Generate Backend Tests",
    ],
});
builder.default();
