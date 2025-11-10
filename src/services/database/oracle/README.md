# Oracle Service Architecture

This directory contains the refactored Oracle database service using a modular generator-based architecture.

## Structure

```text
database/
├── generators/                    # Common database generators
│   ├── BaseScriptGenerator.ts         # Base interface and abstract class
│   └── index.ts                       # Common generator exports
└── oracle/
    ├── OracleService.ts               # Main orchestrator service
    ├── index.ts                       # Export definitions
    └── generators/                    # Oracle-specific generators
        ├── OracleTableGenerator.ts        # Table definition scripts
        ├── OracleConstraintGenerator.ts   # Constraint scripts (PK, FK, UK, CK)
        ├── OracleTriggerGenerator.ts      # Trigger scripts
        ├── OracleCommentGenerator.ts      # Comment scripts
        ├── OracleViewGenerator.ts         # View scripts (TODO)
        ├── OracleDataGenerator.ts         # Data population scripts (TODO)
        ├── OracleCrudGenerator.ts         # CRUD package scripts (TODO)
        └── index.ts                       # Oracle generator exports
```

## Benefits of This Architecture

### 1. **Single Responsibility Principle**

Each generator has one focused responsibility:

- `OracleTableGenerator`: Only handles CREATE TABLE statements
- `OracleConstraintGenerator`: Only handles constraints (PK, FK, UK, CK)
- `OracleTriggerGenerator`: Only handles trigger creation
- `OracleCommentGenerator`: Only handles column comments

### 2. **Open/Closed Principle**

- Easy to add new generators without modifying existing code
- Each generator can be extended independently
- The main service is closed for modification but open for extension

### 3. **Improved Testability**

- Each generator can be unit tested in isolation
- Mock generators can be easily created for testing
- Complex logic is broken down into testable units

### 4. **Better Maintainability**

- Changes to constraint logic only affect `OracleConstraintGenerator`
- Easier to locate and fix issues
- Cleaner, more readable code

### 5. **Reusability**

- Generators can be reused in different contexts
- Can be composed differently for different use cases
- Easy to create alternative service implementations

## Usage

The `OracleService` acts as an orchestrator that:

1. Initializes all generators
2. Updates them with project metadata
3. Calls each generator in sequence to build the complete script
4. Handles file operations and logging

```typescript
// The service automatically uses all registered generators
const oracleService = new OracleService();
await oracleService.execute(config, projectFolder, metadata);
```

## Adding New Generators

To add a new generator:

1. Create a new class extending `AbstractScriptGenerator`
2. Implement the required methods (`generate`, `getSectionName`, `getSectionDescription`)
3. Add it to the generators array in `OracleService.ts`
4. Export it from `generators/index.ts`

## A Database for playing

```sql
ALTER SESSION SET "_ORACLE_SCRIPT"= TRUE;

CREATE TABLESPACE DEV_PLAYGROUND_DB DATAFILE '/opt/oracle/oradata/ORCLCDB/DEV_PLAYGROUND_DB' SIZE 100 M AUTOEXTEND ON NEXT 100 M MAXSIZE 10 G;

CREATE USER DEV_PLAYGROUND_DB IDENTIFIED BY "DEV_PLAYGROUND_DB_pwd" DEFAULT TABLESPACE DEV_PLAYGROUND_DB;

GRANT CONNECT, RESOURCE TO DEV_PLAYGROUND_DB;

GRANT UNLIMITED TABLESPACE TO DEV_PLAYGROUND_DB;

GRANT
    CREATE VIEW TO DEV_PLAYGROUND_DB;
```
