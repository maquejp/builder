# Database Actions

This directory contains action classes related to database operations within the project scaffolding application. Each action class is responsible for generating specific components or scripts based on user input and project configuration.

Note: The database action currently supports Oracle databases.

## Generate Database Scripts

- Tables creation scripts
- Sample data insertion scripts
- Package for the Create, Read, Update, and Delete (CRUD) operations

### Table Definition

A table is defined by its name and a list of columns. Each column has a name, data type, and constraints (e.g., primary key, not null).

A table should have at least one column defined as the primary key. The primary key column name and data type should be specified. The default primary key column name is `pk` with data type `NUMBER`.

A table should have at least the timestamp audit columns: `created_at`, `updated_at`. The default values for these columns should be set to the current timestamp, respectively.

If the system owner requests, additional audit columns can be added, such as `created_by`, `updated_by`.

The data types for the columns should be chosen based on the expected data to be stored in each column.

The constraints name should follow a consistent naming convention, such as:

- `<table_name>_pk` for primary keys
- `<table_name>_<column_name>_nn` for not null constraints
- `<table_name>_<column_name>_un` for unique constraints
- `<table_name>_<column_name>_chk` for check constraints.
- `<table_name>_<column_name>_fk` for foreign key constraints.
- `<table_name>_<column_name>_uk` for unique constraints.
- `<table_name>_<column_name>_idx` for indexes.

The constraints should be defined based on the business rules and requirements.

The constraints should be created outside the creation of the table.

It is recommended to add a trigger to automatically update the `updated_at` column whenever a record is updated.

## Package for CRUD Operations

This package contains procedures and functions to perform Create, Read, Update, and Delete operations on the defined tables. Each operation should handle necessary validations and business logic as required.

This package should include:

- `create_record`: Inserts a new record into the table.
- `update_record`: Updates an existing record in the table.
- `delete_record`: Deletes a record from the table.
- `get_record`: Retrieves a single record by primary key.
- `get_records`: Retrieves multiple records with pagination, sorting, and filtering options.

- `validate_data`: Validates data before create or update operations.
- `handle_all_exceptions`: Centralized exception handling for all operations.

The package should ensure data integrity and consistency throughout all operations.
The package should also include appropriate comments and documentation for each procedure and function, explaining their purpose, parameters, and return values.

## Samples

You can find samples of table definitions and CRUD packages in the `samples` directory:

- [Sample Table Definition and CRUD Package (Oracle)](samples/oracle_table_and_crud_example.sql)

An extra file is in the samples files for a supporting packages

- [Sample Supporting Package (Oracle)](samples/p_utilities_template.sql)
