/**
 * Database Service for handling database setup and operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import boxen from "boxen";
import chalk from "chalk";

import { DatabaseConfiguration, TechnologyStack } from "../interfaces";

export class DatabaseService {
  /**
   * Execute database setup
   * @param stack Database configuration from stack
   * @param config Database configuration from project definition
   */
  public async execute({
    stack,
    config,
  }: {
    stack: TechnologyStack["database"];
    config?: DatabaseConfiguration;
  }): Promise<void> {
    console.log(`🔧 Setting up database...`);
    if (config) {
      switch (stack.type) {
        case "Oracle":
          console.log(`Using Oracle database ${stack.version}`);
          this.showTables(config.tables);

          break;
        default:
          throw new Error(`Unsupported database type: ${stack.type}`);
      }

      console.log(`✅ Database setup completed.`);
    } else {
      throw new Error("No database configuration provided.");
    }
  }

  /**
   * Display tables information in a formatted table
   */
  private showTables(tables: DatabaseConfiguration["tables"]): void {
    const tableData = tables.map((table, index) => ({
      no: index + 1,
      name: table.name,
      fields: table.fields.length,
      referencingTo: table.referencingTo ? table.referencingTo.join(", ") : "-",
      referencedBy: table.referencedBy ? table.referencedBy.join(", ") : "-",
    }));

    // Calculate column widths
    const maxNoWidth = Math.max(
      "No".length,
      Math.max(...tableData.map((t) => t.no.toString().length))
    );
    const maxNameWidth = Math.max(
      "Table Name".length,
      Math.max(...tableData.map((t) => t.name.length))
    );
    const maxFieldsWidth = Math.max(
      "Fields".length,
      Math.max(...tableData.map((t) => t.fields.toString().length))
    );
    const maxReferencingToWidth = Math.max(
      "Referencing To".length,
      Math.max(...tableData.map((t) => t.referencingTo.length))
    );
    const maxReferencedByWidth = Math.max(
      "Referenced By".length,
      Math.max(...tableData.map((t) => t.referencedBy.length))
    );

    // Create header
    const headerNo = chalk.bold.cyan("No".padEnd(maxNoWidth));
    const headerName = chalk.bold.cyan("Table Name".padEnd(maxNameWidth));
    const headerFields = chalk.bold.cyan("Fields".padEnd(maxFieldsWidth));
    const headerReferencingTo = chalk.bold.cyan(
      "Referencing To".padEnd(maxReferencingToWidth)
    );
    const headerReferencedBy = chalk.bold.cyan(
      "Referenced By".padEnd(maxReferencedByWidth)
    );
    const header = `${headerNo} │ ${headerName} │ ${headerFields} │ ${headerReferencingTo} │ ${headerReferencedBy}`;

    // Create separator
    const separator =
      "─".repeat(maxNoWidth) +
      "─┼─" +
      "─".repeat(maxNameWidth) +
      "─┼─" +
      "─".repeat(maxFieldsWidth) +
      "─┼─" +
      "─".repeat(maxReferencingToWidth) +
      "─┼─" +
      "─".repeat(maxReferencedByWidth);

    // Create rows
    const rows = tableData.map((table) => {
      const no = chalk.white(table.no.toString().padEnd(maxNoWidth));
      const name = chalk.yellow(table.name.padEnd(maxNameWidth));
      const fields = chalk.green(
        table.fields.toString().padEnd(maxFieldsWidth)
      );
      const referencingTo = chalk.magenta(
        table.referencingTo.padEnd(maxReferencingToWidth)
      );
      const referencedBy = chalk.blue(
        table.referencedBy.padEnd(maxReferencedByWidth)
      );
      return `${no} │ ${name} │ ${fields} │ ${referencingTo} │ ${referencedBy}`;
    });

    // Combine all parts
    const tableContent = [header, separator, ...rows].join("\n");

    // Display with boxen
    console.log(
      boxen(tableContent, {
        title: chalk.bold.blue("📊 Database Tables & Relations"),
        titleAlignment: "center",
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "blue",
      })
    );
  }

  /**
   * Utility method to simulate async work
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
