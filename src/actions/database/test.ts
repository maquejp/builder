/**
 * Database action integration test
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseAction, DatabaseUtils, DatabaseType } from "./index";

// Test function to demonstrate the database script generator
export function testDatabaseScriptGeneration() {
  console.log("🚀 Testing Database Script Generator...\n");

  // Sample project definition (similar to the one in your project)
  const sampleProjectDatabase = {
    type: "Oracle",
    tables: [
      {
        name: "employees",
        referencingTo: ["departments"],
        fields: [
          {
            name: "pk",
            type: "NUMBER",
            nullable: false,
            isPrimaryKey: true,
            comment: "Primary key",
          },
          {
            name: "first_name",
            type: "VARCHAR2(50 CHAR)",
            nullable: false,
            comment: "Employee first name",
          },
          {
            name: "last_name",
            type: "VARCHAR2(50 CHAR)",
            nullable: false,
            comment: "Employee last name",
          },
          {
            name: "email",
            type: "VARCHAR2(100 CHAR)",
            nullable: false,
            isUnique: true,
            comment: "Employee email address",
          },
          {
            name: "salary",
            type: "NUMBER(10,2)",
            nullable: false,
            checkConstraint: "salary > 0",
            index: true,
            comment: "Employee salary",
          },
          {
            name: "department_fk",
            type: "NUMBER",
            nullable: false,
            isForeignKey: true,
            foreignKey: {
              referencedTable: "departments",
              referencedColumn: "pk",
            },
            comment: "Foreign key referencing departments",
          },
          {
            name: "status",
            type: "NUMBER(1)",
            nullable: false,
            default: "1",
            checkConstraint: "status IN (0, 1)",
            comment: "Employee status (0=inactive, 1=active)",
          },
        ],
      },
      {
        name: "departments",
        referencedBy: ["employees"],
        fields: [
          {
            name: "pk",
            type: "NUMBER",
            nullable: false,
            isPrimaryKey: true,
            comment: "Primary key",
          },
          {
            name: "name",
            type: "VARCHAR2(100 CHAR)",
            nullable: false,
            isUnique: true,
            comment: "Department name",
          },
          {
            name: "description",
            type: "VARCHAR2(500 CHAR)",
            nullable: true,
            comment: "Department description",
          },
          {
            name: "budget",
            type: "NUMBER(12,2)",
            nullable: true,
            checkConstraint: "budget >= 0",
            comment: "Department budget",
          },
        ],
      },
    ],
  };

  try {
    // Convert project definition to internal schema format
    console.log(
      "📊 Converting project definition to internal schema format..."
    );
    const schema = DatabaseUtils.convertProjectDefinitionToSchema(
      sampleProjectDatabase
    );
    console.log(
      `✅ Converted ${schema.tables.length} tables for ${schema.type} database\n`
    );

    // Validate the schema
    console.log("🔍 Validating database schema...");
    const validationErrors = DatabaseAction.validateSchema(schema);
    if (validationErrors.length > 0) {
      console.log("❌ Schema validation failed:");
      validationErrors.forEach((error) => console.log(`   - ${error}`));
      return;
    }
    console.log("✅ Schema validation passed\n");

    // Generate the database scripts
    console.log("⚙️  Generating database scripts...");
    const scripts = DatabaseAction.generateDatabaseScripts(schema, {
      includeDropStatements: true,
      includeComments: true,
      includeAuditColumns: true,
    });

    console.log("✅ Database scripts generated successfully!\n");
    console.log("📄 Generated SQL Script:");
    console.log("=" + "=".repeat(80));
    console.log(scripts);
    console.log("=" + "=".repeat(80));
  } catch (error) {
    console.error("❌ Error during script generation:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseScriptGeneration();
}
