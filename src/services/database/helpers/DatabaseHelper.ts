/**
 * Database helper utilities for common database operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import boxen from "boxen";
import chalk from "chalk";
import { DatabaseConfiguration } from "../../../interfaces";

export class DatabaseHelper {
  /**
   * Sort tables based on dependencies using topological sort
   * Tables that are referenced by others should be created first
   * This method is database-agnostic and can be used with any RDBMS
   */
  public static sortTablesByDependencies(
    tables: DatabaseConfiguration["tables"]
  ): DatabaseConfiguration["tables"] {
    const result: DatabaseConfiguration["tables"] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const tableMap = new Map(tables.map((table) => [table.name, table]));

    const visit = (tableName: string): void => {
      if (visited.has(tableName)) return;
      if (visiting.has(tableName)) {
        console.warn(
          chalk.yellow(
            `⚠️ Circular dependency detected involving table: ${tableName}`
          )
        );
        return;
      }

      visiting.add(tableName);
      const table = tableMap.get(tableName);

      if (table) {
        // Visit all tables that this table references (dependencies)
        if (table.referencingTo) {
          for (const referencedTable of table.referencingTo) {
            if (tableMap.has(referencedTable)) {
              visit(referencedTable);
            }
          }
        }

        visiting.delete(tableName);
        visited.add(tableName);
        result.push(table);
      }
    };

    // Visit all tables
    for (const table of tables) {
      visit(table.name);
    }

    console.log(
      chalk.blue(
        `🔧 Database Helper: Tables sorted by dependencies: ${result
          .map((t) => t.name)
          .join(" → ")}`
      )
    );

    // Add explanation of the sorting process
    console.log(
      boxen(
        chalk.white("📋 ") +
          chalk.bold.cyan("Table Creation Order Explanation") +
          "\n\n" +
          chalk.white(
            "The tables have been sorted using topological sort to ensure proper creation order.\n"
          ) +
          chalk.white("This means:\n\n") +
          chalk.green("✓ ") +
          chalk.white("Tables with no dependencies are created first\n") +
          chalk.green("✓ ") +
          chalk.white(
            "Referenced tables are created before tables that reference them\n"
          ) +
          chalk.green("✓ ") +
          chalk.white(
            "Foreign key constraints will work correctly during creation\n\n"
          ) +
          chalk.yellow("⚡ ") +
          chalk.white("Creation order: ") +
          chalk.bold.blue(result.map((t) => t.name).join(" → ")),
        {
          padding: 1,
          margin: { top: 1, bottom: 1, left: 0, right: 0 },
          borderStyle: "round",
          borderColor: "cyan",
          backgroundColor: "black",
        }
      )
    );

    return result;
  }

  /**
   * Display tables information in a formatted table
   */
  public static showTables(tables: DatabaseConfiguration["tables"]): void {
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
}
