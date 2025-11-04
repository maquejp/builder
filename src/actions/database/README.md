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

### Sample Script

```sql
-- Table creation script
CREATE TABLE employees (
    pk NUMBER,
    name VARCHAR2(100),
    salary NUMBER,
    status NUMBER  DEFAULT 0,
    email VARCHAR2(300),
    position_pk NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Constraint creation script
ALTER TABLE employees
ADD CONSTRAINT employees_pk PRIMARY KEY (pk) USING INDEX ENABLE;

ALTER TABLE employees
ADD CONSTRAINT employees_name_nn NOT NULL (name);

ALTER TABLE employees
ADD CONSTRAINT employees_position_nn NOT NULL (position);

ALTER TABLE employees
ADD CONSTRAINT employees_salary_nn NOT NULL (salary);

ALTER TABLE employees
ADD CONSTRAINT employees_status_nn NOT NULL (status);

ALTER TABLE employees
ADD CONSTRAINT employees_status_chk CHECK (status IN (0, 1));

ALTER TABLE employees
ADD CONSTRAINT employees_salary_chk CHECK (salary >= 0);

ALTER TABLE employees
ADD CONSTRAINT employees_email_un UNIQUE (email);

CREATE INDEX employees_email_idx ON employees(email);

ALTER TABLE employees
ADD CONSTRAINT employees_position_fk FOREIGN KEY (position_pk) REFERENCES positions(pk);
```
