/**
 * Oracle package generator for CRUD operations
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, DatabaseField } from "./types";

export interface PackageGenerationOptions {
  includeValidation?: boolean;
  includeExceptionHandling?: boolean;
  includeJsonSupport?: boolean;
  includePagination?: boolean;
  includeSearch?: boolean;
  packagePrefix?: string;
  utilityPackage?: string;
}

export class OraclePackageGenerator {
  private options: PackageGenerationOptions;

  constructor(options: PackageGenerationOptions = {}) {
    this.options = {
      includeValidation: true,
      includeExceptionHandling: true,
      includeJsonSupport: true,
      includePagination: true,
      includeSearch: true,
      packagePrefix: "pkg_",
      utilityPackage: "p_utilities",
      ...options,
    };
  }

  /**
   * Generate complete Oracle package (specification and body) for CRUD operations
   */
  public generatePackage(table: DatabaseTable): string {
    const packageName = this.getPackageName(table.name);
    const specification = this.generatePackageSpecification(table, packageName);
    const body = this.generatePackageBody(table, packageName);

    return `${specification}\n/\n${body}\n/`;
  }

  /**
   * Generate Oracle package specification
   */
  public generatePackageSpecification(
    table: DatabaseTable,
    packageName?: string
  ): string {
    const pkgName = packageName || this.getPackageName(table.name);
    const fields = this.addAuditColumns(table.fields);
    const nonPkFields = fields.filter((f) => !f.isPrimaryKey);
    const pkFields = fields.filter((f) => f.isPrimaryKey);

    const lines: string[] = [];
    lines.push(`CREATE OR REPLACE PACKAGE ${pkgName} AS`);
    lines.push("");

    // Create record function
    lines.push("   -- Create a new record");
    lines.push(`   FUNCTION create_record (`);
    const createParams = nonPkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(createParams.join(",\n"));
    lines.push("   ) RETURN CLOB;");
    lines.push("");

    // Update record function
    lines.push("   -- Update an existing record");
    lines.push(`   FUNCTION update_record (`);
    const updateParams = fields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(updateParams.join(",\n"));
    lines.push("   ) RETURN CLOB;");
    lines.push("");

    // Delete record function
    lines.push("   -- Delete a record");
    lines.push(`   FUNCTION delete_record (`);
    const deleteParams = pkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(deleteParams.join(",\n"));
    lines.push("   ) RETURN CLOB;");
    lines.push("");

    // Get single record function
    lines.push("   -- Get a single record");
    lines.push(`   FUNCTION get_record (`);
    const getParams = pkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(getParams.join(",\n"));
    lines.push("   ) RETURN CLOB;");
    lines.push("");

    if (this.options.includePagination) {
      // Get multiple records with pagination
      lines.push(
        "   -- Get multiple records with pagination, sorting, and filtering"
      );
      lines.push(`   FUNCTION get_records (`);
      lines.push("      p_page        IN NUMBER DEFAULT 1,");
      lines.push("      p_page_size   IN NUMBER DEFAULT 20,");
      lines.push(
        "      p_sort_by     IN VARCHAR2 DEFAULT '" +
          pkFields[0]?.name.toLowerCase() +
          "',"
      );
      lines.push("      p_sort_order  IN VARCHAR2 DEFAULT 'ASC',");
      lines.push("      p_query       IN VARCHAR2 DEFAULT NULL,");
      lines.push("      p_search_type IN VARCHAR2 DEFAULT 'partial'");
      lines.push("   ) RETURN CLOB;");
      lines.push("");
    }

    lines.push(`END ${pkgName};`);

    return lines.join("\n");
  }

  /**
   * Generate Oracle package body
   */
  public generatePackageBody(
    table: DatabaseTable,
    packageName?: string
  ): string {
    const pkgName = packageName || this.getPackageName(table.name);
    const fields = this.addAuditColumns(table.fields);
    const nonPkFields = fields.filter((f) => !f.isPrimaryKey);
    const pkFields = fields.filter((f) => f.isPrimaryKey);
    const searchableFields = this.getSearchableFields(fields);

    const lines: string[] = [];
    lines.push(`CREATE OR REPLACE PACKAGE BODY ${pkgName} AS`);
    lines.push("");

    // Constants
    if (this.options.includePagination) {
      const sortableColumns = fields.map((f) => f.name.toLowerCase()).join(",");
      lines.push("   -- Valid sortable columns for records");
      lines.push(
        `   c_valid_sort_columns CONSTANT VARCHAR2(500) := '${sortableColumns}';`
      );

      if (searchableFields.length > 0) {
        const searchableColumnsList = searchableFields
          .map((f) => f.name.toLowerCase())
          .join(",");
        lines.push("   -- Searchable fields for records");
        lines.push(
          `   c_searchable_fields  CONSTANT VARCHAR2(500) := '${searchableColumnsList}';`
        );
      }
      lines.push("");
    }

    // Helper functions
    if (this.options.includeValidation) {
      lines.push(...this.generateValidationFunction(table, fields));
      lines.push("");
    }

    if (this.options.includeExceptionHandling) {
      lines.push(...this.generateExceptionHandler());
      lines.push("");
    }

    if (this.options.includeJsonSupport) {
      lines.push(...this.generateRecordObjectFunction(table, fields, pkFields));
      lines.push("");
    }

    // CRUD Functions
    lines.push(
      ...this.generateCreateFunction(table, fields, nonPkFields, pkFields)
    );
    lines.push("");

    lines.push(...this.generateUpdateFunction(table, fields, pkFields));
    lines.push("");

    lines.push(...this.generateDeleteFunction(table, pkFields));
    lines.push("");

    lines.push(...this.generateGetRecordFunction(table, pkFields));
    lines.push("");

    if (this.options.includePagination) {
      lines.push(
        ...this.generateGetRecordsFunction(
          table,
          fields,
          pkFields,
          searchableFields
        )
      );
      lines.push("");
    }

    lines.push(`END ${pkgName};`);

    return lines.join("\n");
  }

  /**
   * Generate validation function
   */
  private generateValidationFunction(
    table: DatabaseTable,
    fields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];
    const pkFields = fields.filter((f) => f.isPrimaryKey);

    lines.push("   /**");
    lines.push("   * Validates data before create or update operations");
    lines.push("   */");
    lines.push("   PROCEDURE validate_data (");

    // Add parameters for all fields, making PK optional for create operations
    const params = fields.map((field) => {
      const isOptional = field.isPrimaryKey ? " DEFAULT NULL" : "";
      return `      p_${field.name.toLowerCase()} IN ${table.name}.${
        field.name
      }%TYPE${isOptional}`;
    });
    lines.push(params.join(",\n"));
    lines.push("   ) IS");
    lines.push("      l_existing_count NUMBER;");
    lines.push("   BEGIN");
    lines.push("      -- Add validation logic here");

    if (pkFields.length > 0) {
      const pkField = pkFields[0];
      lines.push(`      IF p_${pkField.name.toLowerCase()} IS NOT NULL THEN`);
      lines.push("         SELECT COUNT(*)");
      lines.push("           INTO l_existing_count");
      lines.push(`           FROM ${table.name}`);
      lines.push(
        `          WHERE ${pkField.name} = p_${pkField.name.toLowerCase()};`
      );
      lines.push("         IF l_existing_count = 0 THEN");
      lines.push("            RAISE_APPLICATION_ERROR(");
      lines.push("               -20003,");
      lines.push(
        "               'Record with the specified primary key does not exist'"
      );
      lines.push("            );");
      lines.push("         END IF;");
      lines.push("      END IF;");
    }

    lines.push(
      "      -- e.g. RAISE_APPLICATION_ERROR(-20001, 'Validation error message');"
    );
    lines.push("      NULL;");
    lines.push("   END validate_data;");

    return lines;
  }

  /**
   * Generate exception handler function
   */
  private generateExceptionHandler(): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push(
      "   * Handles all exceptions and returns standardized error response"
    );
    lines.push("   */");
    lines.push("   FUNCTION handle_all_exceptions RETURN CLOB IS");
    lines.push("   BEGIN");
    lines.push("      CASE SQLCODE");
    lines.push("         WHEN -1 THEN");
    lines.push(
      `            RETURN ${this.options.utilityPackage}.build_response(`
    );
    lines.push("               'error',");
    lines.push("               'Record already exists',");
    lines.push("               NULL,");
    lines.push("               409");
    lines.push("            );");
    lines.push("         WHEN -20002 THEN");
    lines.push(
      `            RETURN ${this.options.utilityPackage}.build_response(`
    );
    lines.push("               'error',");
    lines.push("               'Referenced record not found',");
    lines.push("               NULL,");
    lines.push("               404");
    lines.push("            );");
    lines.push("         ELSE");
    lines.push(
      `            RETURN ${this.options.utilityPackage}.build_response(`
    );
    lines.push("               'error',");
    lines.push("               'Record operation failed: ' || SQLERRM,");
    lines.push("               NULL,");
    lines.push("               500");
    lines.push("            );");
    lines.push("      END CASE;");
    lines.push("   END handle_all_exceptions;");

    return lines;
  }

  /**
   * Generate record object function for JSON support
   */
  private generateRecordObjectFunction(
    table: DatabaseTable,
    fields: DatabaseField[],
    pkFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push("   * Creates a JSON object for a single record");
    lines.push("   */");
    lines.push("   FUNCTION get_record_object (");

    const params = pkFields.map(
      (field) => `      p_${field.name.toLowerCase()} IN ${field.type}`
    );
    lines.push(params.join(",\n"));
    lines.push("   ) RETURN JSON_OBJECT_T IS");
    lines.push("      l_count       NUMBER;");
    lines.push(`      l_record      ${table.name}%ROWTYPE;`);
    lines.push("      l_json_record JSON_OBJECT_T := JSON_OBJECT_T();");
    lines.push("   BEGIN");
    lines.push("      SELECT COUNT(*)");
    lines.push("        INTO l_count");
    lines.push(`        FROM ${table.name}`);

    if (pkFields.length === 1) {
      lines.push(
        `       WHERE ${
          pkFields[0].name
        } = p_${pkFields[0].name.toLowerCase()};`
      );
    } else {
      const whereConditions = pkFields.map(
        (pk) => `${pk.name} = p_${pk.name.toLowerCase()}`
      );
      lines.push(`       WHERE ${whereConditions.join(" AND ")};`);
    }

    lines.push("      IF l_count = 0 THEN");
    lines.push("         RAISE_APPLICATION_ERROR(");
    lines.push("            -20002,");
    lines.push("            'Record not found'");
    lines.push("         );");
    lines.push("      END IF;");

    // Select all fields
    const selectFields = fields.map((f) => f.name).join(",\n             ");
    lines.push(`      SELECT ${selectFields}`);
    lines.push("        INTO l_record");
    lines.push(`        FROM ${table.name}`);

    if (pkFields.length === 1) {
      lines.push(
        `       WHERE ${
          pkFields[0].name
        } = p_${pkFields[0].name.toLowerCase()};`
      );
    } else {
      const whereConditions = pkFields.map(
        (pk) => `${pk.name} = p_${pk.name.toLowerCase()}`
      );
      lines.push(`       WHERE ${whereConditions.join(" AND ")};`);
    }

    // Add JSON properties
    fields.forEach((field) => {
      lines.push(`      l_json_record.put(`);
      lines.push(`         '${field.name.toLowerCase()}',`);

      if (field.type.toUpperCase().includes("TIMESTAMP")) {
        lines.push(`         TO_CHAR(`);
        lines.push(`            l_record.${field.name},`);
        lines.push(`            'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
        lines.push(`         )`);
      } else {
        lines.push(`         l_record.${field.name}`);
      }
      lines.push("      );");
    });

    lines.push("      RETURN l_json_record;");
    lines.push("   END get_record_object;");

    return lines;
  }

  /**
   * Generate create function
   */
  private generateCreateFunction(
    table: DatabaseTable,
    fields: DatabaseField[],
    nonPkFields: DatabaseField[],
    pkFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push("   * Creates a new record");
    lines.push("   */");
    lines.push("   FUNCTION create_record (");

    const params = nonPkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(params.join(",\n"));
    lines.push("   ) RETURN CLOB IS");

    if (pkFields.length > 0) {
      lines.push(
        `      l_${pkFields[0].name.toLowerCase()}   ${table.name}.${
          pkFields[0].name
        }%TYPE;`
      );
    }
    if (this.options.includeJsonSupport) {
      lines.push("      l_data JSON_OBJECT_T;");
    }
    lines.push("   BEGIN");

    if (this.options.includeValidation) {
      lines.push("      validate_data(");
      const validationParams = nonPkFields.map(
        (field) =>
          `         p_${field.name.toLowerCase()} => p_${field.name.toLowerCase()}`
      );
      lines.push(validationParams.join(",\n"));
      lines.push("      );");
    }

    // Generate primary key if needed
    if (
      pkFields.length > 0 &&
      pkFields[0].type.toUpperCase().includes("NUMBER")
    ) {
      lines.push(`      SELECT NVL(`);
      lines.push(`         MAX(${pkFields[0].name}),`);
      lines.push("         0");
      lines.push("      ) + 1");
      lines.push(`        INTO l_${pkFields[0].name.toLowerCase()}`);
      lines.push(`        FROM ${table.name};`);
      lines.push("");
    }

    // Insert statement
    const insertColumns =
      pkFields.length > 0
        ? [
            pkFields[0].name,
            ...nonPkFields
              .filter((f) => !f.name.toLowerCase().includes("updated_at"))
              .map((f) => f.name),
          ]
        : nonPkFields
            .filter((f) => !f.name.toLowerCase().includes("updated_at"))
            .map((f) => f.name);

    const insertValues =
      pkFields.length > 0
        ? [
            `l_${pkFields[0].name.toLowerCase()}`,
            ...nonPkFields
              .filter((f) => !f.name.toLowerCase().includes("updated_at"))
              .map((f) => `p_${f.name.toLowerCase()}`),
          ]
        : nonPkFields
            .filter((f) => !f.name.toLowerCase().includes("updated_at"))
            .map((f) => `p_${f.name.toLowerCase()}`);

    lines.push(`      INSERT INTO ${table.name} (`);
    lines.push(`         ${insertColumns.join(",\n         ")}`);
    lines.push(
      `      ) VALUES ( ${insertValues.join(",\n                 ")} );`
    );

    if (this.options.includeJsonSupport && pkFields.length > 0) {
      lines.push(
        `      l_data := get_record_object(l_${pkFields[0].name.toLowerCase()});`
      );
      lines.push(`      RETURN ${this.options.utilityPackage}.build_response(`);
      lines.push("         p_status      => 'success',");
      lines.push("         p_http_status => 201,");
      lines.push("         p_message     => 'Record created successfully',");
      lines.push("         p_data        => l_data");
      lines.push("      );");
    } else {
      lines.push(
        `      RETURN '{"status":"success","message":"Record created successfully"}';`
      );
    }

    lines.push("");
    lines.push("   EXCEPTION");
    lines.push("      WHEN OTHERS THEN");
    if (this.options.includeExceptionHandling) {
      lines.push("         RETURN handle_all_exceptions;");
    } else {
      lines.push(
        '         RETURN \'{"status":"error","message":"\' || SQLERRM || \'"}\';'
      );
    }
    lines.push("   END create_record;");

    return lines;
  }

  /**
   * Generate update function
   */
  private generateUpdateFunction(
    table: DatabaseTable,
    fields: DatabaseField[],
    pkFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];
    const nonPkFields = fields.filter((f) => !f.isPrimaryKey);

    lines.push("   /**");
    lines.push("   * Updates an existing record");
    lines.push("   */");
    lines.push("   FUNCTION update_record (");

    const params = fields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(params.join(",\n"));
    lines.push("   ) RETURN CLOB IS");

    if (this.options.includeJsonSupport) {
      lines.push("      l_data JSON_OBJECT_T;");
    }
    lines.push("   BEGIN");

    if (this.options.includeValidation) {
      lines.push("      validate_data(");
      const validationParams = fields.map(
        (field) =>
          `         p_${field.name.toLowerCase()} => p_${field.name.toLowerCase()}`
      );
      lines.push(validationParams.join(",\n"));
      lines.push("      );");
    }

    // Update statement
    const updateFields = nonPkFields.filter(
      (f) => !f.name.toLowerCase().includes("updated_at")
    );
    const updateSets = updateFields.map(
      (field) => `             ${field.name} = p_${field.name.toLowerCase()}`
    );

    // Add updated_at if it exists
    const updatedAtField = fields.find((f) =>
      f.name.toLowerCase().includes("updated_at")
    );
    if (updatedAtField) {
      updateSets.push(
        `             ${updatedAtField.name} = CURRENT_TIMESTAMP`
      );
    }

    lines.push(`      UPDATE ${table.name}`);
    lines.push(`         SET ${updateSets.join(",\n")}`);

    if (pkFields.length === 1) {
      lines.push(
        `       WHERE ${
          pkFields[0].name
        } = p_${pkFields[0].name.toLowerCase()};`
      );
    } else {
      const whereConditions = pkFields.map(
        (pk) => `${pk.name} = p_${pk.name.toLowerCase()}`
      );
      lines.push(`       WHERE ${whereConditions.join(" AND ")};`);
    }

    if (this.options.includeJsonSupport && pkFields.length > 0) {
      const pkParams = pkFields
        .map((pk) => `p_${pk.name.toLowerCase()}`)
        .join(", ");
      lines.push(`      l_data := get_record_object(${pkParams});`);
      lines.push(`      RETURN ${this.options.utilityPackage}.build_response(`);
      lines.push("         p_status      => 'success',");
      lines.push("         p_http_status => 200,");
      lines.push("         p_message     => 'Record updated successfully',");
      lines.push("         p_data        => l_data");
      lines.push("      );");
    } else {
      lines.push(
        `      RETURN '{"status":"success","message":"Record updated successfully"}';`
      );
    }

    lines.push("   EXCEPTION");
    lines.push("      WHEN OTHERS THEN");
    if (this.options.includeExceptionHandling) {
      lines.push("         RETURN handle_all_exceptions;");
    } else {
      lines.push(
        '         RETURN \'{"status":"error","message":"\' || SQLERRM || \'"}\';'
      );
    }
    lines.push("   END update_record;");

    return lines;
  }

  /**
   * Generate delete function
   */
  private generateDeleteFunction(
    table: DatabaseTable,
    pkFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push("   * Deletes a record");
    lines.push("   */");
    lines.push("   FUNCTION delete_record (");

    const params = pkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(params.join(",\n"));
    lines.push("   ) RETURN CLOB IS");
    lines.push("      l_count    NUMBER;");
    if (this.options.includeJsonSupport) {
      lines.push("      l_response JSON_OBJECT_T;");
    }
    lines.push("   BEGIN");
    lines.push("      SELECT COUNT(*)");
    lines.push("        INTO l_count");
    lines.push(`        FROM ${table.name}`);

    if (pkFields.length === 1) {
      lines.push(
        `       WHERE ${
          pkFields[0].name
        } = p_${pkFields[0].name.toLowerCase()};`
      );
    } else {
      const whereConditions = pkFields.map(
        (pk) => `${pk.name} = p_${pk.name.toLowerCase()}`
      );
      lines.push(`       WHERE ${whereConditions.join(" AND ")};`);
    }

    lines.push("      IF l_count = 0 THEN");
    lines.push("         RAISE_APPLICATION_ERROR(");
    lines.push("            -20002,");
    lines.push("            'Record not found for deletion'");
    lines.push("         );");
    lines.push("      END IF;");
    lines.push(`      DELETE FROM ${table.name}`);

    if (pkFields.length === 1) {
      lines.push(
        `       WHERE ${
          pkFields[0].name
        } = p_${pkFields[0].name.toLowerCase()};`
      );
    } else {
      const whereConditions = pkFields.map(
        (pk) => `${pk.name} = p_${pk.name.toLowerCase()}`
      );
      lines.push(`       WHERE ${whereConditions.join(" AND ")};`);
    }

    if (this.options.includeJsonSupport) {
      lines.push("      -- Build deleted record response");
      lines.push("      l_response := JSON_OBJECT_T();");
      if (pkFields.length === 1) {
        lines.push("      l_response.put(");
        lines.push(`         'deleted_id',`);
        lines.push(`         p_${pkFields[0].name.toLowerCase()}`);
        lines.push("      );");
      } else {
        pkFields.forEach((pk) => {
          lines.push("      l_response.put(");
          lines.push(`         'deleted_${pk.name.toLowerCase()}',`);
          lines.push(`         p_${pk.name.toLowerCase()}`);
          lines.push("      );");
        });
      }
      lines.push(`      RETURN ${this.options.utilityPackage}.build_response(`);
      lines.push("         'success',");
      lines.push("         'Record deleted successfully',");
      lines.push("         l_response,");
      lines.push("         200");
      lines.push("      );");
    } else {
      lines.push(
        `      RETURN '{"status":"success","message":"Record deleted successfully"}';`
      );
    }

    lines.push("   EXCEPTION");
    lines.push("      WHEN OTHERS THEN");
    if (this.options.includeExceptionHandling) {
      lines.push("         RETURN handle_all_exceptions;");
    } else {
      lines.push(
        '         RETURN \'{"status":"error","message":"\' || SQLERRM || \'"}\';'
      );
    }
    lines.push("   END delete_record;");

    return lines;
  }

  /**
   * Generate get record function
   */
  private generateGetRecordFunction(
    table: DatabaseTable,
    pkFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push("   * Retrieves a single record");
    lines.push("   */");
    lines.push("   FUNCTION get_record (");

    const params = pkFields.map(
      (field) =>
        `      p_${field.name.toLowerCase()} IN ${table.name}.${
          field.name
        }%TYPE`
    );
    lines.push(params.join(",\n"));
    lines.push("   ) RETURN CLOB IS");

    if (this.options.includeJsonSupport) {
      lines.push("      l_data JSON_OBJECT_T;");
    }
    lines.push("   BEGIN");

    if (this.options.includeJsonSupport) {
      const pkParams = pkFields
        .map((pk) => `p_${pk.name.toLowerCase()}`)
        .join(", ");
      lines.push(`      l_data := get_record_object(${pkParams});`);
      lines.push('      RETURN \'{"status":"success","data":\'');
      lines.push("             || l_data.to_clob()");
      lines.push("             || '}';");
    } else {
      lines.push(
        `      RETURN '{"status":"success","message":"Record retrieved"}';`
      );
    }

    lines.push("   END get_record;");

    return lines;
  }

  /**
   * Generate get records function with pagination
   */
  private generateGetRecordsFunction(
    table: DatabaseTable,
    fields: DatabaseField[],
    pkFields: DatabaseField[],
    searchableFields: DatabaseField[]
  ): string[] {
    const lines: string[] = [];

    lines.push("   /**");
    lines.push(
      "   * Retrieves multiple records with pagination, sorting, and filtering"
    );
    lines.push("   */");
    lines.push("   FUNCTION get_records (");
    lines.push("      p_page        IN NUMBER DEFAULT 1,");
    lines.push("      p_page_size   IN NUMBER DEFAULT 20,");
    lines.push(
      "      p_sort_by     IN VARCHAR2 DEFAULT '" +
        (pkFields[0]?.name.toLowerCase() || "id") +
        "',"
    );
    lines.push("      p_sort_order  IN VARCHAR2 DEFAULT 'ASC',");
    lines.push("      p_query       IN VARCHAR2 DEFAULT NULL,");
    lines.push("      p_search_type IN VARCHAR2 DEFAULT 'partial'");
    lines.push("   ) RETURN CLOB IS");

    lines.push("      v_total_count      NUMBER;");
    lines.push("      v_offset           NUMBER;");
    lines.push("      v_valid_page       NUMBER;");
    lines.push("      v_valid_size       NUMBER;");
    lines.push("      v_limit            NUMBER;");
    lines.push("      v_total_pages      NUMBER;");
    lines.push("      v_data             JSON_ARRAY_T := JSON_ARRAY_T();");
    lines.push("      v_record_data      JSON_OBJECT_T;");
    lines.push("      v_valid_sort_by    VARCHAR2(50);");
    lines.push("      v_valid_sort_order VARCHAR2(10);");
    lines.push("      v_sort_clause      VARCHAR2(100);");
    lines.push("      v_where_clause     VARCHAR2(1000);");
    lines.push("      v_sql              VARCHAR2(4000);");
    lines.push("      ");
    lines.push("      -- Optimized cursor with ref cursor for dynamic SQL");
    lines.push("      TYPE t_cursor IS REF CURSOR;");
    lines.push("      c_records          t_cursor;");
    lines.push("");
    lines.push("      -- Variables for fetching minimal data");
    lines.push(
      `      -- Only need ${
        pkFields[0]?.name.toLowerCase() || "pk"
      } for get_record_object() call`
    );
    lines.push(
      `      v_${pkFields[0]?.name.toLowerCase() || "pk"}               ${
        pkFields[0]?.type || "NUMBER"
      };`
    );
    lines.push("   BEGIN");

    lines.push(
      "      -- Validate pagination parameters using centralized utility"
    );
    lines.push(
      `      ${this.options.utilityPackage}.validate_pagination_parameters(`
    );
    lines.push("         p_page       => p_page,");
    lines.push("         p_page_size  => p_page_size,");
    lines.push("         p_valid_page => v_valid_page,");
    lines.push("         p_valid_size => v_valid_size,");
    lines.push("         p_offset     => v_offset,");
    lines.push("         p_limit      => v_limit");
    lines.push("      );");
    lines.push("");

    lines.push(
      "      -- Validate and normalize sorting parameters using centralized utility"
    );
    lines.push(
      `      ${this.options.utilityPackage}.validate_sorting_parameters(`
    );
    lines.push("         p_sort_by          => p_sort_by,");
    lines.push("         p_sort_order       => p_sort_order,");
    lines.push("         p_valid_columns    => c_valid_sort_columns,");
    lines.push("         p_valid_sort_by    => v_valid_sort_by,");
    lines.push("         p_valid_sort_order => v_valid_sort_order,");
    lines.push("         p_sort_clause      => v_sort_clause");
    lines.push("      );");

    if (searchableFields.length > 0) {
      lines.push(
        "      -- Build WHERE clause with embedded search values (no bind variables needed)"
      );
      lines.push(
        `      v_where_clause := ${this.options.utilityPackage}.build_where_clause(`
      );
      lines.push("         p_query,");
      lines.push("         p_search_type,");
      lines.push("         c_searchable_fields");
      lines.push("      );");
    } else {
      lines.push("      v_where_clause := '1=1';");
    }

    lines.push("");
    lines.push("      -- Get total count with complete WHERE clause");
    lines.push(
      `      v_sql := 'SELECT COUNT(*) FROM ${table.name} ' || v_where_clause;`
    );
    lines.push("      EXECUTE IMMEDIATE v_sql");
    lines.push("        INTO v_total_count;");
    lines.push("      ");
    lines.push("      -- Calculate total pages");
    lines.push("      v_total_pages := CEIL(v_total_count / p_page_size);");
    lines.push("      ");
    lines.push("      -- Check if no records found and raise error");
    lines.push("      IF v_total_count = 0 THEN");
    lines.push("         RAISE_APPLICATION_ERROR(");
    lines.push("            -20003,");
    lines.push("            'No records found'");
    lines.push("         );");
    lines.push("      END IF;");
    lines.push("");

    const pkField = pkFields[0]?.name || "pk";
    lines.push(
      `      -- Build optimized SQL with only ${pkField.toLowerCase()} (minimal data transfer)`
    );
    lines.push(`      v_sql := 'SELECT ${pkField} FROM ${table.name} '`);
    lines.push("               || 'WHERE '");
    lines.push("               || v_where_clause");
    lines.push("               || ' '");
    lines.push("               || 'ORDER BY '");
    lines.push("               || v_sort_clause");
    lines.push("               || ' '");
    lines.push(
      "               || 'OFFSET :offset ROWS FETCH NEXT :page_size ROWS ONLY';"
    );
    lines.push("      OPEN c_records FOR v_sql");
    lines.push("         USING v_offset, p_page_size;");
    lines.push("");

    lines.push(
      "      -- Build data array efficiently (minimal data transfer, then full record via get_record_object)"
    );
    lines.push("      LOOP");
    lines.push(`         FETCH c_records INTO v_${pkField.toLowerCase()};`);
    lines.push("         EXIT WHEN c_records%NOTFOUND;");
    lines.push("         ");
    lines.push(
      "         -- Create JSON object using existing get_record_object function"
    );
    lines.push(
      `         v_record_data := get_record_object(v_${pkField.toLowerCase()});`
    );
    lines.push("         v_data.append(v_record_data);");
    lines.push("      END LOOP;");
    lines.push("");
    lines.push("      CLOSE c_records;");
    lines.push("");

    lines.push("      -- Return paginated response using centralized function");
    lines.push(
      `      RETURN ${this.options.utilityPackage}.build_paginated_response(`
    );
    lines.push(`         p_entity_name        => '${table.name}',`);
    lines.push("         p_status             => 'success',");
    lines.push("         p_http_status        => 200,");
    lines.push("         p_page               => p_page,");
    lines.push("         p_page_size          => p_page_size,");
    lines.push("         p_sort_by            => v_valid_sort_by,");
    lines.push("         p_sort_order         => v_valid_sort_order,");
    lines.push("         p_query              => p_query,");
    lines.push("         p_search_type        => p_search_type,");

    if (searchableFields.length > 0) {
      const searchableColumnsList = searchableFields
        .map((f) => f.name.toLowerCase())
        .join('", "');
      lines.push("         p_search_columns     => JSON_ARRAY_T('[\"'");
      lines.push(`                                          || REPLACE(`);
      lines.push("            c_searchable_fields,");
      lines.push("            ',',");
      lines.push("            '\", \"'");
      lines.push("         ) || '\"]'),");
    } else {
      lines.push("         p_search_columns     => JSON_ARRAY_T('[]'),");
    }

    lines.push("         p_data_array         => v_data,");
    lines.push("         p_total_records      => v_total_count,");
    lines.push("         p_total_pages        => v_total_pages,");
    lines.push("         p_additional_filters => NULL");
    lines.push("      );");
    lines.push("   EXCEPTION");
    lines.push("      WHEN OTHERS THEN");
    lines.push(
      "         -- Ensure cursor is properly closed in case of exceptions"
    );
    lines.push("         IF c_records%ISOPEN THEN");
    lines.push("            CLOSE c_records;");
    lines.push("         END IF;");
    if (this.options.includeExceptionHandling) {
      lines.push("         RETURN handle_all_exceptions;");
    } else {
      lines.push(
        '         RETURN \'{"status":"error","message":"\' || SQLERRM || \'"}\';'
      );
    }
    lines.push("   END get_records;");

    return lines;
  }

  /**
   * Get package name based on table name
   */
  private getPackageName(tableName: string): string {
    return `${this.options.packagePrefix}${tableName.toLowerCase()}`;
  }

  /**
   * Add audit columns if not present
   */
  private addAuditColumns(fields: DatabaseField[]): DatabaseField[] {
    const result = [...fields];

    // Check if audit columns already exist
    const hasCreatedAt = fields.some((f) =>
      f.name.toLowerCase().includes("created_at")
    );
    const hasUpdatedAt = fields.some((f) =>
      f.name.toLowerCase().includes("updated_at")
    );

    if (!hasCreatedAt) {
      result.push({
        name: "created_at",
        type: "TIMESTAMP",
        default: "CURRENT_TIMESTAMP",
        nullable: false,
        comment: "Record creation timestamp",
      });
    }

    if (!hasUpdatedAt) {
      result.push({
        name: "updated_at",
        type: "TIMESTAMP",
        default: "CURRENT_TIMESTAMP",
        nullable: false,
        comment: "Record last update timestamp",
      });
    }

    return result;
  }

  /**
   * Get searchable fields (typically VARCHAR2/NVARCHAR2 fields)
   */
  private getSearchableFields(fields: DatabaseField[]): DatabaseField[] {
    return fields.filter((field) => {
      const type = field.type.toUpperCase();
      return (
        type.includes("VARCHAR") ||
        type.includes("CHAR") ||
        type.includes("CLOB")
      );
    });
  }
}
