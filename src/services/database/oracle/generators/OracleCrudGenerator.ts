/**
 * Oracle CRUD Package Generator for handling Oracle PL/SQL packages
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import {
  DatabaseTable,
  DatabaseField,
  ProjectMetadata,
} from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";

/**
 * Interface for mapping table columns that are available for foreign key references
 */
interface TableColumnMapping {
  [tableName: string]: string[];
}

/**
 * Generates Oracle CRUD package scripts (PL/SQL packages for CRUD operations)
 * Creates standardized packages with:
 * - CREATE procedures
 * - READ functions/procedures
 * - UPDATE procedures
 * - DELETE procedures
 * - Validation functions
 * - Error handling
 */
export class OracleCrudGenerator extends AbstractScriptGenerator {
  private tableColumnMappings: TableColumnMapping;

  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);

    // Initialize table column mappings
    // TODO: This should ideally come from actual database schema introspection
    this.tableColumnMappings = {
      table1: [
        "pk",
        "description",
        "table2_fk",
        "table5_fk",
        "created_on",
        "modified_on",
      ],
      table2: ["pk", "description", "created_on", "modified_on"],
      table3: [
        "pk",
        "name",
        "description",
        "code",
        "created_on",
        "modified_on",
      ],
      table4: [
        "pk",
        "title",
        "table2_fk",
        "priority",
        "created_on",
        "modified_on",
      ],
      table5: [
        "pk",
        "code",
        "table4_fk",
        "quantity",
        "active",
        "created_on",
        "modified_on",
      ],
    };
  }

  /**
   * Generate CRUD package section with header
   */
  public generate(table: DatabaseTable): string | null {
    const crudScript = this.createCrudScript(table);
    if (!crudScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${crudScript}`;
  }

  /**
   * Get the section name for CRUD packages
   */
  public getSectionName(): string {
    return "CRUD PACKAGES";
  }

  /**
   * Get the section description for CRUD packages
   */
  public getSectionDescription(): string {
    return "PL/SQL packages for Create, Read, Update, Delete operations";
  }

  /**
   * Create CRUD package script content
   */
  private createCrudScript(table: DatabaseTable): string | null {
    if (!table.fields || table.fields.length === 0) {
      return null;
    }

    const tableName = table.name.toLowerCase();
    const packageName = `p_${tableName}`;
    const primaryKeyField = this.getPrimaryKeyField(table);

    if (!primaryKeyField) {
      console.warn(
        `Warning: No primary key found for table ${tableName}. CRUD package will not be generated.`
      );
      return null;
    }

    const packageSpec = this.generatePackageSpecification(
      table,
      packageName,
      primaryKeyField
    );
    const packageBody = this.generatePackageBody(
      table,
      packageName,
      primaryKeyField
    );

    return `${packageSpec}

${packageBody}`;
  }

  /**
   * Get the primary key field from the table
   */
  private getPrimaryKeyField(table: DatabaseTable): DatabaseField | null {
    return table.fields.find((field) => field.isPrimaryKey) || null;
  }

  /**
   * Generate package specification (header)
   */
  private generatePackageSpecification(
    table: DatabaseTable,
    packageName: string,
    primaryKeyField: DatabaseField
  ): string {
    const tableName = table.name.toLowerCase();
    const upperTableName = table.name.toUpperCase();
    const primaryKeyType = this.getOracleType(primaryKeyField.type);
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const author = this.projectMetadata?.author || "Jean-Philippe Maquestiaux";
    const license = this.projectMetadata?.license || "EUPL-1.2";

    // Get non-primary key fields for parameters
    const nonPkFields = table.fields.filter(
      (field) => !field.isPrimaryKey && !this.isAuditField(field.name)
    );

    const createParams = nonPkFields
      .map(
        (field) =>
          `      p_${field.name.toLowerCase()} in ${tableName}.${field.name.toLowerCase()}%type`
      )
      .join(",\n");

    const updateParams = nonPkFields
      .map(
        (field) =>
          `      p_${field.name.toLowerCase()} in ${tableName}.${field.name.toLowerCase()}%type`
      )
      .join(",\n");

    return `/*
   ================================================================================
                        ${packageName.toUpperCase()} PACKAGE
   ================================================================================
   Package for managing ${upperTableName} records with comprehensive
   CRUD operations, validation, and standardized JSON responses.

   Author: ${author}
   Date: ${timestamp}
   License: ${license}

   Dependencies: ${tableName} table with triggers, P_UTILITIES package
   ================================================================================
   */

create or replace package ${packageName} as
   /*
   ============================================================================
                              PUBLIC FUNCTIONS
   ============================================================================
   */

   /**
    * Creates a new ${tableName} record
    * @return JSON response with created record data or error
    * @status_codes 201 (Created), 400 (Validation Error), 500 (Error)
    */
   function create_record (
${createParams}
   ) return clob;

   /**
    * Updates an existing ${tableName} record
    * @param p_${primaryKeyField.name.toLowerCase()} Primary key of the record to update (required)
    * @return JSON response with updated record data or error
    * @status_codes 200 (Updated), 400 (Validation Error), 404 (Not Found), 500 (Error)
    */
   function update_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType},
${updateParams}
   ) return clob;

   /**
    * Deletes a ${tableName} record by primary key
    * @param p_${primaryKeyField.name.toLowerCase()} Primary key of the record to delete (required)
    * @return JSON response with success confirmation or error
    * @status_codes 200 (Deleted), 404 (Not Found), 500 (Error)
    */
   function delete_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType}
   ) return clob;
  
   /**
    * Retrieves ${tableName} records as JSON array with pagination and sorting support
    * @param p_page Page number (default: 1, minimum: 1)
    * @param p_page_size Number of records per page (default: 20, maximum: 100)
    * @param p_sort_by Field to sort by (default: '${primaryKeyField.name.toLowerCase()}')
    * @param p_sort_order Sort direction (default: 'ASC', valid: ASC, DESC)
    * @param p_query Search query (optional)
    * @param p_search_type Search type (default: 'partial', valid: exact, partial, starts_with)
    * @return JSON response with paginated ${tableName} records and metadata
    * @status_codes 200 (Success), 400 (Validation Error), 500 (Error)
    */
   function get_records (
      p_page        in number default 1,
      p_page_size   in number default 20,
      p_sort_by     in varchar2 default '${primaryKeyField.name.toLowerCase()}',
      p_sort_order  in varchar2 default 'ASC',
      p_query       in varchar2 default null,
      p_search_type in varchar2 default 'partial'
   ) return clob;
   
   /**
    * Retrieves a single ${tableName} record by primary key
    * @param p_${primaryKeyField.name.toLowerCase()} Primary key of the record to retrieve (required)
    * @return JSON response with ${tableName} record data or error
    * @status_codes 200 (Found), 404 (Not Found), 500 (Error)
    */
   function get_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType}
   ) return clob;

end ${packageName};
/`;
  }

  /**
   * Generate package body (implementation)
   */
  private generatePackageBody(
    table: DatabaseTable,
    packageName: string,
    primaryKeyField: DatabaseField
  ): string {
    const tableName = table.name.toLowerCase();
    const upperTableName = table.name.toUpperCase();
    const primaryKeyType = this.getOracleType(primaryKeyField.type);

    // Get searchable fields (text fields excluding audit fields)
    const searchableFields = table.fields
      .filter(
        (field) => !this.isAuditField(field.name) && this.isTextType(field.type)
      )
      .map((field) => `${tableName}.${field.name.toLowerCase()}`)
      .join(",");

    // Get valid sortable columns
    const sortableColumns = table.fields
      .map((field) => field.name.toLowerCase())
      .join(",");

    // Get non-primary key fields for parameters
    const nonPkFields = table.fields.filter(
      (field) => !field.isPrimaryKey && !this.isAuditField(field.name)
    );

    const validationCalls = nonPkFields
      .map((field) => {
        if (field.isForeignKey && field.foreignKey) {
          return this.generateForeignKeyValidation(field);
        }
        return this.generateFieldValidation(field);
      })
      .filter((validation) => validation)
      .join("\n\n      ");

    const insertFields = nonPkFields
      .map((field) => field.name.toLowerCase())
      .join(",\n             ");
    const insertValues = nonPkFields
      .map((field) => `p_${field.name.toLowerCase()}`)
      .join(",\n             ");

    const updateAssignments = nonPkFields
      .map(
        (field) =>
          `         ${field.name.toLowerCase()} = p_${field.name.toLowerCase()}`
      )
      .join(",\n");

    return `create or replace package body ${packageName} as

   /*
   ============================================================================
                                  CONSTANTS
   ============================================================================
   */
   
   -- Valid sortable columns for ${tableName} records
   c_valid_sort_columns constant varchar2(500) := '${sortableColumns}';
   
   -- Searchable fields for ${tableName} records
   c_search_fields      constant varchar2(500) := '${searchableFields}';

   /*
   ============================================================================
                               PRIVATE FUNCTIONS
   ============================================================================
   */

   /**
    * Validates ${tableName} data before create or update operations
    * @param p_${primaryKeyField.name.toLowerCase()} Primary key of the ${tableName} (null for create)
    * @raise_application_error if validation fails
    */
   procedure validate_data (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType} default null,
${nonPkFields
  .map(
    (field) =>
      `      p_${field.name.toLowerCase()} in ${tableName}.${field.name.toLowerCase()}%type`
  )
  .join(",\n")}
   ) is
      l_existing_count number;
   begin
      ${validationCalls}

      -- All validations passed - no exception raised
   end validate_data;

   /**
    * Handles all exceptions and returns standardized error response
    */
   function handle_all_exceptions return clob is
   begin
      return p_utilities.build_response(
         p_status => 'error',
         p_message => 'An unexpected error occurred: ' || sqlerrm,
         p_http_status => 500
      );
   end handle_all_exceptions;

   /**
    * Creates a JSON object for a single ${tableName} record
    * @param p_${primaryKeyField.name.toLowerCase()} Primary key of the ${tableName} to format
    * @return JSON object with ${tableName} data
    */
   function get_record_object (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType}
   ) return json_object_t is
      l_count number;
      l_record_object json_object_t;
      
      -- Individual variables for ${tableName} fields
${table.fields
  .map(
    (field) =>
      `      l_${field.name.toLowerCase()} ${tableName}.${field.name.toLowerCase()}%type;`
  )
  .join("\n")}

${this.generateRelatedTableVariables(table)}
   begin
      select count(*)
        into l_count
        from ${tableName}
       where ${primaryKeyField.name.toLowerCase()} = p_${primaryKeyField.name.toLowerCase()};
       
      if l_count = 0 then
         return null;
      end if;
      
      -- Fetch ${tableName} data with related table information
      select ${this.generateSelectFieldsWithJoins(table, tableName)}
        into ${this.generateIntoFieldsWithJoins(table)}
        from ${tableName}${this.generateLeftJoins(table, tableName)}
       where ${tableName}.${primaryKeyField.name.toLowerCase()} = p_${primaryKeyField.name.toLowerCase()};
      
      -- Create JSON object using individual variables
      l_record_object := json_object_t();
${this.generateJsonObjectPuts(table)}
      
      return l_record_object;
   end get_record_object;

   /*
   ============================================================================
                               MAIN FUNCTIONS
   ============================================================================
   */

   /**
    * Creates a new ${tableName} record
    */
   function create_record (
${nonPkFields
  .map(
    (field) =>
      `      p_${field.name.toLowerCase()} in ${tableName}.${field.name.toLowerCase()}%type`
  )
  .join(",\n")}
   ) return clob is
      l_${primaryKeyField.name.toLowerCase()} ${primaryKeyType};
      l_${tableName}_data json_object_t;
   begin
      -- Validate input data
      validate_data(
         p_${primaryKeyField.name.toLowerCase()} => null,
${nonPkFields
  .map(
    (field) =>
      `         p_${field.name.toLowerCase()} => p_${field.name.toLowerCase()}`
  )
  .join(",\n")}
      );

      -- Generate new primary key
      select nvl(max(${primaryKeyField.name.toLowerCase()}), 0) + 1
        into l_${primaryKeyField.name.toLowerCase()}
        from ${tableName};

      -- Insert new record
      insert into ${tableName} (
             ${primaryKeyField.name.toLowerCase()},
             ${insertFields}
      ) values (
             l_${primaryKeyField.name.toLowerCase()},
             ${insertValues}
      );

      -- Get created record data
      l_${tableName}_data := get_record_object(l_${primaryKeyField.name.toLowerCase()});

      return p_utilities.build_response(
         p_status => 'success',
         p_message => '${upperTableName} record created successfully',
         p_data => l_${tableName}_data,
         p_http_status => 201
      );

   exception
      when others then
         return handle_all_exceptions;
   end create_record;

   /**
    * Updates an existing ${tableName} record
    */
   function update_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType},
${nonPkFields
  .map(
    (field) =>
      `      p_${field.name.toLowerCase()} in ${tableName}.${field.name.toLowerCase()}%type`
  )
  .join(",\n")}
   ) return clob is
      l_${tableName}_data json_object_t;
   begin
      -- Validate input data
      validate_data(
         p_${primaryKeyField.name.toLowerCase()} => p_${primaryKeyField.name.toLowerCase()},
${nonPkFields
  .map(
    (field) =>
      `         p_${field.name.toLowerCase()} => p_${field.name.toLowerCase()}`
  )
  .join(",\n")}
      );

      -- Update record
      update ${tableName}
         set
${updateAssignments}
       where ${primaryKeyField.name.toLowerCase()} = p_${primaryKeyField.name.toLowerCase()};

      if sql%rowcount = 0 then
         return p_utilities.build_response(
            p_status => 'error',
            p_message => '${upperTableName} record not found',
            p_http_status => 404
         );
      end if;

      -- Get updated record data
      l_${tableName}_data := get_record_object(p_${primaryKeyField.name.toLowerCase()});

      return p_utilities.build_response(
         p_status => 'success',
         p_message => '${upperTableName} record updated successfully',
         p_data => l_${tableName}_data,
         p_http_status => 200
      );

   exception
      when others then
         return handle_all_exceptions;
   end update_record;

   /**
    * Deletes a ${tableName} record by primary key
    */
   function delete_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType}
   ) return clob is
      l_response json_object_t;
   begin
      -- Delete record
      delete from ${tableName}
       where ${primaryKeyField.name.toLowerCase()} = p_${primaryKeyField.name.toLowerCase()};

      if sql%rowcount = 0 then
         return p_utilities.build_response(
            p_status => 'error',
            p_message => '${upperTableName} record not found',
            p_http_status => 404
         );
      end if;

      l_response := json_object_t();
      l_response.put('${primaryKeyField.name.toLowerCase()}', p_${primaryKeyField.name.toLowerCase()});

      return p_utilities.build_response(
         p_status => 'success',
         p_message => '${upperTableName} record deleted successfully',
         p_data => l_response,
         p_http_status => 200
      );

   exception
      when others then
         return handle_all_exceptions;
   end delete_record;

   /**
    * Retrieves ${tableName} records with pagination and sorting
    */
   function get_records (
      p_page        in number default 1,
      p_page_size   in number default 20,
      p_sort_by     in varchar2 default '${primaryKeyField.name.toLowerCase()}',
      p_sort_order  in varchar2 default 'ASC',
      p_query       in varchar2 default null,
      p_search_type in varchar2 default 'partial'
   ) return clob is
      v_total_count      number;
      v_offset           number;
      v_valid_page       number;
      v_valid_size       number;
      v_limit            number;
      v_total_pages      number;
      v_data             json_array_t := json_array_t();
      v_record_data      json_object_t;
      v_valid_sort_by    varchar2(50);
      v_valid_sort_order varchar2(10);
      v_sort_clause      varchar2(100);
      v_where_clause     varchar2(1000);
      v_sql              varchar2(4000);
      v_search_columns   json_array_t;
      
      -- Optimized cursor with ref cursor for dynamic SQL
      type t_cursor is ref cursor;
      c_records          t_cursor;

      -- Variables for fetching minimal data
      -- Only need pk for get_record_object() call
      v_${primaryKeyField.name.toLowerCase()} ${primaryKeyType};
   begin
      -- Validate pagination parameters using centralized utility
      p_utilities.validate_pagination_parameters(
         p_page       => p_page,
         p_page_size  => p_page_size,
         p_valid_page => v_valid_page,
         p_valid_size => v_valid_size,
         p_offset     => v_offset,
         p_limit      => v_limit
      );

      -- Validate and normalize sorting parameters using centralized utility
      p_utilities.validate_sorting_parameters(
         p_sort_by          => p_sort_by,
         p_sort_order       => p_sort_order,
         p_valid_columns    => c_valid_sort_columns,
         p_valid_sort_by    => v_valid_sort_by,
         p_valid_sort_order => v_valid_sort_order,
         p_sort_clause      => v_sort_clause
      );

      -- Build WHERE clause with embedded search values (no bind variables needed)
      v_where_clause := p_utilities.build_where_clause(
         p_query,
         p_search_type,
         c_search_fields
      );
      
      -- Get total count with complete WHERE clause
      v_sql := 'SELECT COUNT(*) FROM ${tableName}' || v_where_clause;
      execute immediate v_sql
        into v_total_count;
      
      -- Calculate total pages
      v_total_pages := ceil(v_total_count / v_valid_size);
      
      -- Check if no records found and raise error
      if v_total_count = 0 then
         raise_application_error(
            -20003,
            'No ${tableName} records found'
         );
      end if;
      
      -- Build optimized SQL with only pk (minimal data transfer)
      v_sql := 'SELECT ${primaryKeyField.name.toLowerCase()} FROM ${tableName}' 
               || v_where_clause
               || ' ORDER BY ' || v_sort_clause
               || ' OFFSET :offset ROWS FETCH NEXT :page_size ROWS ONLY';
      
      -- Open cursor with simplified dynamic SQL (only pagination bind variables)
      open c_records for v_sql
         using v_offset, v_valid_size;
      
      -- Build data array efficiently (minimal data transfer, then full record via get_record_object)
      loop
         fetch c_records into v_${primaryKeyField.name.toLowerCase()};
         exit when c_records%notfound;
         
         -- Create JSON object using existing get_record_object function
         v_record_data := get_record_object(v_${primaryKeyField.name.toLowerCase()});
         if v_record_data is not null then
            v_data.append(v_record_data);
         end if;
      end loop;

      close c_records;

      -- Build search columns array
      v_search_columns := json_array_t();
${searchableFields
  .split(",")
  .map((field) => {
    const fieldName = field.trim().split(".")[1] || field.trim();
    return `      v_search_columns.append('${fieldName}');`;
  })
  .join("\n")}

      -- Return paginated response using centralized function
      return p_utilities.build_paginated_response(
         p_status             => 'success',
         p_http_status        => 200,
         p_page               => v_valid_page,
         p_page_size          => v_valid_size,
         p_sort_by            => v_valid_sort_by,
         p_sort_order         => v_valid_sort_order,
         p_query              => p_query,
         p_search_type        => p_search_type,
         p_data_array         => v_data,
         p_total_records      => v_total_count,
         p_total_pages        => v_total_pages,
         p_entity_name        => '${upperTableName}',
         p_search_columns     => v_search_columns,
         p_additional_filters => null
      );
   exception
      when others then
         -- Ensure cursor is properly closed in case of exceptions
         if c_records%isopen then
            close c_records;
         end if;
         return handle_all_exceptions;
   end get_records;

   /**
    * Retrieves a single ${tableName} record by primary key
    */
   function get_record (
      p_${primaryKeyField.name.toLowerCase()} in ${primaryKeyType}
   ) return clob is
      l_${tableName}_data json_object_t;
   begin
      l_${tableName}_data := get_record_object(p_${primaryKeyField.name.toLowerCase()});

      if l_${tableName}_data is null then
         return p_utilities.build_response(
            p_status => 'error',
            p_message => '${upperTableName} record not found',
            p_http_status => 404
         );
      end if;

      return p_utilities.build_response(
         p_status => 'success',
         p_message => '${upperTableName} record retrieved successfully',
         p_data => l_${tableName}_data,
         p_http_status => 200
      );

   exception
      when others then
         return handle_all_exceptions;
   end get_record;

end ${packageName};
/`;
  }

  /**
   * Check if field is an audit field (created_at, updated_at, etc.)
   */
  private isAuditField(fieldName: string): boolean {
    const auditFields = [
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "created_on",
      "modified_on",
    ];
    return auditFields.includes(fieldName.toLowerCase());
  }

  /**
   * Check if field type is a text type for searching
   */
  private isTextType(fieldType: string): boolean {
    const textTypes = [
      "varchar",
      "varchar2",
      "char",
      "nvarchar",
      "nvarchar2",
      "nchar",
      "clob",
      "nclob",
      "text",
      "string",
    ];
    return textTypes.some((type) =>
      fieldType.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Convert field type to Oracle type
   */
  private getOracleType(fieldType: string): string {
    const type = fieldType.toLowerCase();

    if (type.includes("varchar") || type.includes("string")) {
      return "varchar2";
    } else if (type.includes("number") || type.includes("int")) {
      return "number";
    } else if (type.includes("date") || type.includes("timestamp")) {
      return "date";
    } else if (type.includes("clob") || type.includes("text")) {
      return "clob";
    } else if (type.includes("blob")) {
      return "blob";
    }

    return fieldType;
  }

  /**
   * Generate field validation logic
   */
  private generateFieldValidation(field: DatabaseField): string | null {
    const fieldName = field.name.toLowerCase();

    if (!field.nullable) {
      return `-- Validate ${fieldName} (required field)
      if p_${fieldName} is null or (p_${fieldName} is not null and trim(p_${fieldName}) = '') then
         raise_application_error(-20001, '${fieldName.toUpperCase()} is required');
      end if;`;
    }

    if (this.isTextType(field.type) && field.type.includes("(")) {
      const maxLength = field.type.match(/\((\d+)\)/)?.[1];
      if (maxLength) {
        return `-- Validate ${fieldName} length
      if p_${fieldName} is not null and length(p_${fieldName}) > ${maxLength} then
         raise_application_error(-20001, '${fieldName.toUpperCase()} cannot exceed ${maxLength} characters');
      end if;`;
      }
    }

    return null;
  }

  /**
   * Generate foreign key validation logic
   */
  private generateForeignKeyValidation(field: DatabaseField): string | null {
    if (!field.isForeignKey || !field.foreignKey) {
      return null;
    }

    const fieldName = field.name.toLowerCase();
    const refTable = field.foreignKey.referencedTable.toLowerCase();
    const refColumn = field.foreignKey.referencedColumn.toLowerCase();

    return `-- Validate ${fieldName} foreign key
      if p_${fieldName} is not null then
         select count(*)
           into l_existing_count
           from ${refTable}
          where ${refColumn} = p_${fieldName};

         if l_existing_count = 0 then
            raise_application_error(-20002, 'Invalid ${fieldName.toUpperCase()}: referenced record does not exist');
         end if;
      end if;`;
  }

  /**
   * Generate variables for related table fields
   * Uses actual table schema information to generate only existing columns
   */
  private generateRelatedTableVariables(table: DatabaseTable): string {
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    if (foreignKeyFields.length === 0) {
      return "";
    }

    const variables: string[] = [];

    foreignKeyFields.forEach((field) => {
      if (field.foreignKey) {
        const refTable = field.foreignKey.referencedTable.toLowerCase();
        const displayableColumns = this.getDisplayableColumnsForTable(refTable);

        if (displayableColumns.length > 0) {
          variables.push(`      -- ${refTable.toUpperCase()} fields`);
          displayableColumns.forEach((column) => {
            variables.push(
              `      l_${refTable}_${column} ${refTable}.${column}%type;`
            );
          });
        }
      }
    });

    return variables.length > 0 ? "\n" + variables.join("\n") : "";
  }

  /**
   * Generate SELECT fields including JOINs
   */
  private generateSelectFieldsWithJoins(
    table: DatabaseTable,
    tableName: string
  ): string {
    const fields: string[] = [];

    // Add main table fields
    table.fields.forEach((field) => {
      fields.push(`${tableName}.${field.name.toLowerCase()}`);
    });

    // Add related table fields
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    foreignKeyFields.forEach((field) => {
      if (field.foreignKey) {
        const refTable = field.foreignKey.referencedTable.toLowerCase();
        const displayableColumns = this.getDisplayableColumnsForTable(refTable);

        displayableColumns.forEach((column) => {
          fields.push(`${refTable}.${column}`);
        });
      }
    });

    return fields.join(",\n             ");
  }

  /**
   * Generate INTO clause fields including related table fields
   */
  private generateIntoFieldsWithJoins(table: DatabaseTable): string {
    const fields: string[] = [];

    // Add main table variables
    table.fields.forEach((field) => {
      fields.push(`l_${field.name.toLowerCase()}`);
    });

    // Add related table variables
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    foreignKeyFields.forEach((field) => {
      if (field.foreignKey) {
        const refTable = field.foreignKey.referencedTable.toLowerCase();
        const displayableColumns = this.getDisplayableColumnsForTable(refTable);

        displayableColumns.forEach((column) => {
          fields.push(`l_${refTable}_${column}`);
        });
      }
    });

    return fields.join(",\n             ");
  }

  /**
   * Generate LEFT JOIN clauses for foreign key relationships
   */
  private generateLeftJoins(table: DatabaseTable, tableName: string): string {
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    if (foreignKeyFields.length === 0) {
      return "";
    }

    const joins: string[] = [];

    foreignKeyFields.forEach((field) => {
      if (field.foreignKey) {
        const refTable = field.foreignKey.referencedTable.toLowerCase();
        const refColumn = field.foreignKey.referencedColumn.toLowerCase();
        const fieldName = field.name.toLowerCase();

        joins.push(`\n        left join ${refTable}`);
        joins.push(
          `      on ${tableName}.${fieldName} = ${refTable}.${refColumn}`
        );
      }
    });

    return joins.join("\n");
  }

  /**
   * Get available columns for a referenced table
   * @param tableName The name of the referenced table
   * @returns Array of column names that exist in the referenced table
   */
  private getAvailableColumnsForTable(tableName: string): string[] {
    const lowerTableName = tableName.toLowerCase();
    return (
      this.tableColumnMappings[lowerTableName] || [
        "pk",
        "description",
        "created_on",
        "modified_on",
      ]
    );
  }

  /**
   * Get displayable columns for a referenced table (excluding system columns)
   * @param tableName The name of the referenced table
   * @returns Array of column names suitable for display in JSON responses
   */
  private getDisplayableColumnsForTable(tableName: string): string[] {
    const availableColumns = this.getAvailableColumnsForTable(tableName);
    // Filter out system columns that are not typically displayed
    const systemColumns = ["pk", "created_on", "modified_on"];
    return availableColumns.filter(
      (col) => !systemColumns.includes(col.toLowerCase())
    );
  }

  /**
   * Generate JSON object put statements including conditional related table data
   */
  private generateJsonObjectPuts(table: DatabaseTable): string {
    const puts: string[] = [];

    // Add main table fields
    table.fields.forEach((field) => {
      const fieldName = field.name.toLowerCase();
      puts.push(`      l_record_object.put('${fieldName}', l_${fieldName});`);
    });

    // Add conditional puts for related table information
    const foreignKeyFields = table.fields.filter(
      (field) => field.isForeignKey && field.foreignKey
    );
    foreignKeyFields.forEach((field) => {
      if (field.foreignKey) {
        const refTable = field.foreignKey.referencedTable.toLowerCase();
        const fieldName = field.name.toLowerCase();
        const displayableColumns = this.getDisplayableColumnsForTable(refTable);

        if (displayableColumns.length > 0) {
          puts.push("");
          puts.push(`      -- Add ${refTable} information if available`);
          puts.push(`      if l_${fieldName} is not null then`);

          displayableColumns.forEach((column) => {
            puts.push(`         if l_${refTable}_${column} is not null then`);
            puts.push(
              `            l_record_object.put('${refTable}_${column}', l_${refTable}_${column});`
            );
            puts.push(`         end if;`);
          });

          puts.push(`      end if;`);
        }
      }
    });

    return puts.join("\n");
  }
}
