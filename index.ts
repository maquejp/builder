/**
 * Main entry point for the Builder application
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { Builder } from "./src/Builder";

// Create an instance and execute the default method
const builder = new Builder({
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
