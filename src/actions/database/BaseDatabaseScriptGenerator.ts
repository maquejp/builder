/**
 * Abstract base class for database script generators
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseType,
  DatabaseTable,
  DatabaseField,
  DatabaseConstraint,
  DatabaseIndex,
  DatabaseTrigger,
  GeneratedScriptComponents,
  ScriptGenerationOptions,
  ConstraintNamingConvention,
  DEFAULT_AUDIT_COLUMNS,
} from "./types";

export abstract class BaseDatabaseScriptGenerator {
  protected databaseType: DatabaseType;
  protected options: Required<ScriptGenerationOptions>;

  constructor(
    databaseType: DatabaseType,
    options: ScriptGenerationOptions = {}
  ) {
    this.databaseType = databaseType;
    this.options = this.mergeWithDefaults(options);
  }

  /**
   * Generate complete database scripts for all tables
   */
  public generateDatabaseScripts(tables: DatabaseTable[]): string {
    const components = this.generateScriptComponents(tables);
    return this.assembleScript(components);
  }

  /**
   * Generate script components for all tables
   */
  protected generateScriptComponents(
    tables: DatabaseTable[]
  ): GeneratedScriptComponents {
    const components: GeneratedScriptComponents = {
      dropStatements: [],
      tableCreation: [],
      constraints: [],
      indexes: [],
      triggers: [],
      comments: [],
    };

    // Sort tables by dependencies (referenced tables first)
    const sortedTables = this.sortTablesByDependencies(tables);

    // Generate drop statements (in reverse order)
    if (this.options.includeDropStatements) {
      const reversedTables = [...sortedTables].reverse();
      components.dropStatements = reversedTables.map((table) =>
        this.generateDropStatement(table)
      );
    }

    // Generate table creation scripts
    for (const table of sortedTables) {
      components.tableCreation.push(this.generateTableCreation(table));
      components.constraints.push(...this.generateConstraints(table));
      components.indexes.push(...this.generateIndexes(table));
      components.triggers.push(...this.generateTriggers(table));

      if (this.options.includeComments) {
        components.comments.push(...this.generateComments(table));
      }
    }

    return components;
  }

  /**
   * Assemble all script components into a single script
   */
  protected assembleScript(components: GeneratedScriptComponents): string {
    const scriptParts: string[] = [];

    // Add header comment
    scriptParts.push(this.generateScriptHeader());

    // Add drop statements
    if (components.dropStatements.length > 0) {
      scriptParts.push("-- Drop existing objects");
      scriptParts.push(...components.dropStatements);
      scriptParts.push("");
    }

    // Add table creation
    if (components.tableCreation.length > 0) {
      scriptParts.push("-- Table creation scripts");
      scriptParts.push(...components.tableCreation);
      scriptParts.push("");
    }

    // Add constraints
    if (components.constraints.length > 0) {
      scriptParts.push("-- Constraint creation scripts");
      scriptParts.push(...components.constraints);
      scriptParts.push("");
    }

    // Add indexes
    if (components.indexes.length > 0) {
      scriptParts.push("-- Index creation scripts");
      scriptParts.push(...components.indexes);
      scriptParts.push("");
    }

    // Add triggers
    if (components.triggers.length > 0) {
      scriptParts.push("-- Trigger creation scripts");
      scriptParts.push(...components.triggers);
      scriptParts.push("");
    }

    // Add comments
    if (components.comments.length > 0) {
      scriptParts.push("-- Table and column comments");
      scriptParts.push(...components.comments);
      scriptParts.push("");
    }

    return scriptParts.join("\n");
  }

  /**
   * Sort tables by their dependencies (referenced tables first)
   */
  protected sortTablesByDependencies(tables: DatabaseTable[]): DatabaseTable[] {
    const sorted: DatabaseTable[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (table: DatabaseTable) => {
      if (visiting.has(table.name)) {
        throw new Error(
          `Circular dependency detected involving table: ${table.name}`
        );
      }

      if (visited.has(table.name)) {
        return;
      }

      visiting.add(table.name);

      // Visit dependencies first (tables this table references)
      if (table.referencingTo) {
        for (const referencedTableName of table.referencingTo) {
          const referencedTable = tables.find(
            (t) => t.name === referencedTableName
          );
          if (referencedTable) {
            visit(referencedTable);
          }
        }
      }

      visiting.delete(table.name);
      visited.add(table.name);
      sorted.push(table);
    };

    for (const table of tables) {
      visit(table);
    }

    return sorted;
  }

  /**
   * Generate constraint name using naming convention
   */
  protected generateConstraintName(
    type: keyof ConstraintNamingConvention,
    tableName: string,
    columnName?: string
  ): string {
    let pattern = this.options.constraintNamingConvention[type];
    pattern = pattern.replace("{table}", tableName);
    if (columnName) {
      pattern = pattern.replace("{column}", columnName);
    }
    return pattern;
  }

  /**
   * Add audit columns to table if enabled
   */
  protected addAuditColumns(fields: DatabaseField[]): DatabaseField[] {
    if (!this.options.includeAuditColumns) {
      return fields;
    }

    const auditColumns: DatabaseField[] = [];
    const auditNames = this.options.auditColumnNames;

    // Check if audit columns already exist
    const existingFieldNames = fields.map((f) => f.name.toLowerCase());

    if (!existingFieldNames.includes(auditNames.createdAt!.toLowerCase())) {
      auditColumns.push({
        name: auditNames.createdAt!,
        type: this.getTimestampType(),
        nullable: false,
        default: this.getCurrentTimestampFunction(),
        comment: "Record creation timestamp",
      });
    }

    if (!existingFieldNames.includes(auditNames.updatedAt!.toLowerCase())) {
      auditColumns.push({
        name: auditNames.updatedAt!,
        type: this.getTimestampType(),
        nullable: false,
        default: this.getCurrentTimestampFunction(),
        comment: "Record last update timestamp",
      });
    }

    return [...fields, ...auditColumns];
  }

  /**
   * Generate script header comment
   */
  protected generateScriptHeader(): string {
    const date = new Date().toISOString().split("T")[0];
    return `-- Database script generated by Stackcraft
-- Generated on: ${date}
-- Database type: ${this.databaseType}
-- ============================================

`;
  }

  /**
   * Merge provided options with defaults
   */
  private mergeWithDefaults(
    options: ScriptGenerationOptions
  ): Required<ScriptGenerationOptions> {
    return {
      includeDropStatements: options.includeDropStatements ?? true,
      includeComments: options.includeComments ?? true,
      includeAuditColumns: options.includeAuditColumns ?? true,
      auditColumnNames: {
        ...DEFAULT_AUDIT_COLUMNS,
        ...options.auditColumnNames,
      },
      constraintNamingConvention:
        options.constraintNamingConvention ?? this.getDefaultNamingConvention(),
    };
  }

  // Abstract methods to be implemented by database-specific generators
  protected abstract generateDropStatement(table: DatabaseTable): string;
  protected abstract generateTableCreation(table: DatabaseTable): string;
  protected abstract generateConstraints(table: DatabaseTable): string[];
  protected abstract generateIndexes(table: DatabaseTable): string[];
  protected abstract generateTriggers(table: DatabaseTable): string[];
  protected abstract generateComments(table: DatabaseTable): string[];
  protected abstract getTimestampType(): string;
  protected abstract getCurrentTimestampFunction(): string;
  protected abstract getDefaultNamingConvention(): ConstraintNamingConvention;
}
