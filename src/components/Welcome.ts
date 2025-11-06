/**
 * Welcome component for displaying app information
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import boxen from "boxen";
import chalk from "chalk";
import { readPackageInfo, PackageInfo } from "../services/PackageService";

export class Welcome {
  private packageInfo: PackageInfo;

  constructor() {
    this.packageInfo = readPackageInfo();
  }

  /**
   * Display the welcome screen
   */
  public display(): void {
    this.displayHeader();
    this.displayDescription();
    this.displayUsage();
    this.displayLinks();
  }

  /**
   * Display the main header box
   */
  private displayHeader(): void {
    const headerContent =
      chalk.bold.cyan(`🚀 STACKCRAFT\n\n`) +
      `${chalk.gray("Version:")} ${chalk.blue(this.packageInfo.version)}\n` +
      `${chalk.gray("Author:")}  ${chalk.blue(this.packageInfo.author)}\n` +
      `${chalk.gray("License:")} ${chalk.blue(this.packageInfo.license)}`;

    const headerBox = boxen(headerContent, {
      padding: 1,
      margin: 1,
      borderStyle: "double",
      borderColor: "cyan",
      textAlignment: "center",
    });

    console.log(headerBox);
  }

  /**
   * Display the description box
   */
  private displayDescription(): void {
    const descriptionContent =
      chalk.bold.yellow("DESCRIPTION\n\n") +
      `A CLI tool to scaffold full-stack projects with\n` +
      `complete folder structure, frontend, backend & database.\n\n` +
      chalk.green("Generate complete project structures including:\n") +
      `• Organized folder structures\n` +
      `• Angular frontend applications\n` +
      `• ExpressJS backend servers\n` +
      `• SQL database scripts and setup`;

    const descriptionBox = boxen(descriptionContent, {
      padding: 1,
      margin: { left: 1, right: 1, top: 0, bottom: 1 },
      borderStyle: "single",
      borderColor: "yellow",
    });

    console.log(descriptionBox);
  }

  /**
   * Display usage information
   */
  private displayUsage(): void {
    console.log(chalk.bold.blue("🔧 Usage:"));
    console.log(
      `  ${chalk.cyan("stackcraft --help")}    Show available commands`
    );
    console.log(
      `  ${chalk.cyan("stackcraft generate")}  Generate from configuration file`
    );
    console.log("");
  }

  /**
   * Display package and documentation links
   */
  private displayLinks(): void {
    console.log(chalk.bold.magenta("📦 NPM Package:"));
    console.log(
      `   ${chalk.underline(
        "https://www.npmjs.com/package/@maquestiaux-foundry/stackcraft"
      )}`
    );
    console.log("");

    console.log(chalk.bold.green("📖 Documentation & Source:"));
    console.log(
      `   ${chalk.underline("https://github.com/maquejp/stackcraft")}`
    );
    console.log("");
  }

  /**
   * Get package information
   */
  public getPackageInfo(): PackageInfo {
    return this.packageInfo;
  }
}
