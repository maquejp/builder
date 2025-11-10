/**
 * Oracle Data Generator for handling Oracle database data population
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { DatabaseTable, ProjectMetadata } from "../../../../interfaces";
import { DatabaseHelper } from "../../helpers";
import { AbstractScriptGenerator } from "../../generators";
import { faker } from "@faker-js/faker";

/**
 * Generates Oracle data population scripts (INSERT statements)
 * TODO: Implement data population logic based on table configuration
 */
export class OracleDataGenerator extends AbstractScriptGenerator {
  constructor(projectMetadata?: ProjectMetadata) {
    super(projectMetadata);
  }

  /**
   * Generate data population section with header
   */
  public generate(table: DatabaseTable): string | null {
    const dataScript = this.createDataScript(table);
    if (!dataScript) {
      return null;
    }

    const sectionHeader = DatabaseHelper.generateSectionHeader(
      this.getSectionName(),
      this.getSectionDescription()
    );

    return `${sectionHeader}

${dataScript}`;
  }

  /**
   * Get the section name for data population
   */
  public getSectionName(): string {
    return "INITIAL DATA";
  }

  /**
   * Get the section description for data population
   */
  public getSectionDescription(): string {
    return "Initial data population and seed data";
  }

  /**
   * Create data population script content
   */
  private createDataScript(table: DatabaseTable): string | null {
    const insertStatements: string[] = [];
    const recordCount = 22; // Generate at least 22 records for pagination testing

    // Get primary key field
    const primaryKeyField = table.fields.find((field) => field.isPrimaryKey);
    if (!primaryKeyField) {
      return null; // Skip tables without primary key
    }

    // Get foreign key fields with their reference information
    const foreignKeyFields = table.fields.filter((field) => field.isForeignKey);

    // Generate INSERT statements
    for (let i = 1; i <= recordCount; i++) {
      const fieldValues: string[] = [];
      const fieldNames: string[] = [];

      for (const field of table.fields) {
        // Skip timestamp fields with default values (SYSTIMESTAMP)
        if (field.default === "systimestamp" || field.trigger?.enabled) {
          continue;
        }

        fieldNames.push(field.name);
        fieldValues.push(this.generateFieldValue(field, i, table.name));
      }

      if (fieldNames.length > 0) {
        const insertStatement = `INSERT INTO ${table.name} (${fieldNames.join(
          ", "
        )}) VALUES (${fieldValues.join(", ")});`;
        insertStatements.push(insertStatement);
      }
    }

    if (insertStatements.length === 0) {
      return null;
    }

    // Add commit statement at the end
    insertStatements.push("COMMIT;");

    return insertStatements.join("\n");
  }

  /**
   * Generate appropriate value for a field based on its type and constraints
   */
  private generateFieldValue(
    field: any,
    recordIndex: number,
    tableName: string
  ): string {
    // Handle primary key
    if (field.isPrimaryKey) {
      return recordIndex.toString();
    }

    // Handle foreign keys
    if (field.isForeignKey) {
      // For foreign keys, we'll use a cyclic pattern to reference existing IDs
      // This assumes the referenced table also has 22+ records
      const referencedId = ((recordIndex - 1) % 22) + 1;
      return referencedId.toString();
    }

    // Handle allowed values (enums) first - this takes priority over data types
    if (field.allowedValues && field.allowedValues.length > 0) {
      const valueIndex = (recordIndex - 1) % field.allowedValues.length;
      const value = field.allowedValues[valueIndex];
      return typeof value === "string" ? `'${value}'` : value.toString();
    }

    // Handle different data types
    const fieldType = field.type.toLowerCase();

    if (fieldType.includes("varchar2") || fieldType.includes("char")) {
      return this.generateStringValue(field, recordIndex, tableName);
    }

    if (fieldType.includes("number")) {
      return this.generateNumberValue(field, recordIndex);
    }

    if (fieldType.includes("timestamp") || fieldType.includes("date")) {
      return "SYSTIMESTAMP";
    }

    // Default handling
    if (field.nullable) {
      return "NULL";
    }

    return `'DEFAULT_${recordIndex}'`;
  }

  /**
   * Generate string values based on field name and constraints using Faker for realistic data
   */
  private generateStringValue(
    field: any,
    recordIndex: number,
    tableName: string
  ): string {
    const fieldName = field.name.toLowerCase();

    // Set a consistent seed based on record index for reproducible results
    faker.seed(recordIndex * 1000 + fieldName.charCodeAt(0));

    // Special handling for common field names with realistic fake data
    if (fieldName.includes("description")) {
      const descriptions = [
        faker.lorem.sentence({ min: 4, max: 8 }),
        faker.company.catchPhrase(),
        faker.hacker.phrase(),
        `${faker.color.human()} ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`,
        faker.commerce.productDescription(),
      ];
      const desc = descriptions[recordIndex % descriptions.length];
      return `'${desc.replace(/'/g, "''")}'`; // Escape single quotes for SQL
    }

    if (fieldName.includes("name")) {
      const names = [
        faker.person.fullName(),
        faker.company.name(),
        faker.commerce.productName(),
        `${faker.color.human()} ${faker.animal.type()}`,
        faker.music.songName(),
      ];
      const name = names[recordIndex % names.length];
      return `'${name.replace(/'/g, "''")}'`;
    }

    if (fieldName.includes("title")) {
      const titles = [
        faker.person.jobTitle(),
        faker.book.title(),
        faker.lorem.words({ min: 2, max: 4 }),
        faker.company.buzzPhrase(),
        `${
          faker.science.chemicalElement().name
        } ${faker.commerce.department()}`,
      ];
      const title = titles[recordIndex % titles.length];
      return `'${title.replace(/'/g, "''")}'`;
    }

    if (fieldName.includes("code")) {
      const codes = [
        faker.string.alphanumeric({ length: 6, casing: "upper" }),
        `${faker.location.countryCode()}-${faker.string.numeric(4)}`,
        `${tableName.toUpperCase()}_${faker.string.alphanumeric({
          length: 4,
          casing: "upper",
        })}`,
        faker.finance.accountNumber(8),
        faker.vehicle.vin().substring(0, 10),
      ];
      const code = codes[recordIndex % codes.length];
      return `'${code}'`;
    }

    if (fieldName.includes("status")) {
      const statuses = [
        "ACTIVE",
        "INACTIVE",
        "PENDING",
        "COMPLETED",
        "SUSPENDED",
        "IN_PROGRESS",
        "CANCELLED",
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ];
      const statusIndex = (recordIndex - 1) % statuses.length;
      return `'${statuses[statusIndex]}'`;
    }

    if (fieldName.includes("email")) {
      return `'${faker.internet.email()}'`;
    }

    if (fieldName.includes("phone")) {
      return `'${faker.phone.number()}'`;
    }

    if (fieldName.includes("address")) {
      return `'${faker.location.streetAddress()}'`;
    }

    if (fieldName.includes("city")) {
      return `'${faker.location.city()}'`;
    }

    if (fieldName.includes("country")) {
      return `'${faker.location.country()}'`;
    }

    if (fieldName.includes("url") || fieldName.includes("website")) {
      return `'${faker.internet.url()}'`;
    }

    if (fieldName.includes("color")) {
      return `'${faker.color.human()}'`;
    }

    if (fieldName.includes("category") || fieldName.includes("type")) {
      const categories = [
        faker.commerce.department(),
        faker.music.genre(),
        faker.vehicle.type(),
        faker.animal.type(),
        faker.commerce.productAdjective(),
      ];
      const category = categories[recordIndex % categories.length];
      return `'${category.replace(/'/g, "''")}'`;
    }

    // Default realistic string values
    const defaultValues = [
      faker.lorem.words({ min: 1, max: 3 }),
      faker.commerce.productAdjective(),
      faker.color.human(),
      faker.word.adjective(),
      faker.word.noun(),
    ];
    const defaultValue = defaultValues[recordIndex % defaultValues.length];
    return `'${defaultValue.replace(/'/g, "''")}'`;
  }

  /**
   * Generate number values with realistic variation using Faker
   */
  private generateNumberValue(field: any, recordIndex: number): string {
    const fieldName = field.name.toLowerCase();

    // Set a consistent seed for reproducible results
    faker.seed(recordIndex * 2000 + fieldName.charCodeAt(0));

    if (fieldName.includes("priority")) {
      // Priority between 1-5
      return faker.number.int({ min: 1, max: 5 }).toString();
    }

    if (fieldName.includes("quantity") || fieldName.includes("count")) {
      // Realistic quantity values
      return faker.number.int({ min: 1, max: 250 }).toString();
    }

    if (
      fieldName.includes("amount") ||
      fieldName.includes("price") ||
      fieldName.includes("cost")
    ) {
      // Realistic monetary amounts
      const amount = faker.number.float({
        min: 10,
        max: 9999,
        fractionDigits: 2,
      });
      return amount.toString();
    }

    if (fieldName.includes("percentage") || fieldName.includes("percent")) {
      // Percentage values 0-100
      return faker.number.int({ min: 0, max: 100 }).toString();
    }

    if (fieldName.includes("age")) {
      // Realistic age values
      return faker.number.int({ min: 18, max: 95 }).toString();
    }

    if (fieldName.includes("year")) {
      // Recent years
      return faker.number.int({ min: 2020, max: 2025 }).toString();
    }

    if (fieldName.includes("month")) {
      // Month values 1-12
      return faker.number.int({ min: 1, max: 12 }).toString();
    }

    if (fieldName.includes("day")) {
      // Day values 1-31
      return faker.number.int({ min: 1, max: 31 }).toString();
    }

    if (fieldName.includes("rating") || fieldName.includes("score")) {
      // Rating scale 1-10
      return faker.number.int({ min: 1, max: 10 }).toString();
    }

    if (fieldName.includes("weight")) {
      // Weight in reasonable range
      return faker.number.int({ min: 1, max: 1000 }).toString();
    }

    if (fieldName.includes("height")) {
      // Height in centimeters
      return faker.number.int({ min: 150, max: 200 }).toString();
    }

    if (fieldName.includes("duration") || fieldName.includes("time")) {
      // Duration in minutes
      return faker.number.int({ min: 5, max: 480 }).toString();
    }

    // Default realistic number value
    return faker.number.int({ min: 1, max: 1000 }).toString();
  }
}
