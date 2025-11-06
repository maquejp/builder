/**
 * Package Service for handling package.json information
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as fs from "fs";
import * as path from "path";

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
}

/**
 * Read package.json information
 */
export function readPackageInfo(): PackageInfo {
  try {
    const packagePath = path.join(__dirname, "../../package.json");
    const packageContent = fs.readFileSync(packagePath, "utf8");
    return JSON.parse(packageContent);
  } catch (error) {
    // Fallback if package.json can't be read
    return {
      name: "Stackcraft",
      version: "0.0.0-beta.0.0.7",
      description: "A CLI tool to scaffold full-stack projects",
      author: "Jean-Philippe Maquestiaux",
      license: "EUPL-1.2",
    };
  }
}
