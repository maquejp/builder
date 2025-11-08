/**
 * File helper utilities for application-wide file operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";

export class FileHelper {
  /**
   * Save a script file with proper directory structure
   * @param projectFolder The project folder name
   * @param category The category/type of script (e.g., 'database', 'backend', 'frontend')
   * @param subCategory The subcategory (e.g., 'tables', 'views', 'procedures', 'controllers', etc.)
   * @param fileName The name of the file (without extension)
   * @param content The content to write to the file
   * @param extension The file extension (default: 'sql')
   * @returns The full path where the file was saved
   */
  public static async saveScript({
    projectFolder,
    category,
    subCategory,
    fileName,
    content,
    extension = "sql",
  }: {
    projectFolder: string;
    category: string;
    subCategory: string;
    fileName: string;
    content: string;
    extension?: string;
  }): Promise<string> {
    // Create output directory structure
    const outputDir = path.join(
      "generated",
      projectFolder,
      category,
      subCategory
    );
    await fs.ensureDir(outputDir);

    // Create the full file path
    const scriptFileName = `${fileName.toLowerCase()}.${extension}`;
    const scriptFilePath = path.join(outputDir, scriptFileName);

    // Write the file
    await fs.writeFile(scriptFilePath, content, "utf8");

    // Log the success
    console.log(
      chalk.green(
        `💾 Saved ${category}/${subCategory} script: ${scriptFilePath}`
      )
    );

    return scriptFilePath;
  }

  /**
   * Save a database script to file with proper directory structure
   * @param projectFolder The project folder name
   * @param scriptType The type of script (e.g., 'tables', 'views', 'procedures')
   * @param fileName The name of the file (without extension)
   * @param content The content to write to the file
   * @param extension The file extension (default: 'sql')
   * @param order Optional order number for execution sequence (will be zero-padded to 3 digits)
   * @returns The full path where the file was saved
   */
  public static async saveDatabaseScript({
    projectFolder,
    scriptType,
    fileName,
    content,
    extension = "sql",
    order,
  }: {
    projectFolder: string;
    scriptType: string;
    fileName: string;
    content: string;
    extension?: string;
    order?: number;
  }): Promise<string> {
    // Add order prefix if provided
    const finalFileName =
      order !== undefined
        ? `${order.toString().padStart(3, "0")}_${fileName}`
        : fileName;

    return this.saveScript({
      projectFolder,
      category: "database",
      subCategory: scriptType,
      fileName: finalFileName,
      content,
      extension,
    });
  }

  /**
   * Ensure a directory structure exists
   * @param projectFolder The project folder name
   * @param category The category/type (e.g., 'database', 'backend', 'frontend')
   * @param subCategory The subcategory (e.g., 'tables', 'views', 'controllers', etc.)
   * @returns The created directory path
   */
  public static async ensureDir(
    projectFolder: string,
    category: string,
    subCategory: string
  ): Promise<string> {
    const outputDir = path.join(
      "generated",
      projectFolder,
      category,
      subCategory
    );
    await fs.ensureDir(outputDir);

    console.log(
      chalk.green(
        `📁 Created ${category}/${subCategory} directory: ${outputDir}`
      )
    );

    return outputDir;
  }

  /**
   * Ensure a database directory structure exists
   * @param projectFolder The project folder name
   * @param scriptType The type of script directory to create
   * @returns The created directory path
   */
  public static async ensureDatabaseDir(
    projectFolder: string,
    scriptType: string
  ): Promise<string> {
    return this.ensureDir(projectFolder, "database", scriptType);
  }
}
