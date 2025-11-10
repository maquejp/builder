/**
 * Data Generation Service for creating realistic fake data across different domains
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import { faker } from "@faker-js/faker";
import { ProjectDefinition, DatabaseField } from "../interfaces";

export type DomainType =
  | "health"
  | "digital"
  | "finance"
  | "ecommerce"
  | "education"
  | "realestate"
  | "space"
  | "innovation"
  | "procurement"
  | null;

/**
 * Service for generating realistic fake data based on domain context and field specifications
 */
export class DataGenerationService {
  private domainContext: DomainType = null;

  constructor(projectDefinition?: ProjectDefinition) {
    this.domainContext = this.inferDomainFromProject(projectDefinition);
  }

  /**
   * Infer domain context from project definition
   */
  private inferDomainFromProject(
    projectDefinition?: ProjectDefinition
  ): DomainType {
    if (!projectDefinition) return null;

    const description = projectDefinition.description?.toLowerCase() || "";
    const name = projectDefinition.name?.toLowerCase() || "";
    const combined = `${name} ${description}`;

    console.log(`🔍 Analyzing project for domain context: "${combined}"`);

    // Health/Medical domain keywords
    if (
      combined.match(
        /health|medical|hospital|clinic|patient|doctor|nurse|pharmacy|medicine|healthcare/
      )
    ) {
      console.log(`🏥 Detected HEALTH domain from project context`);
      return "health";
    }

    // Digital/Tech domain keywords
    if (
      combined.match(
        /digital|tech|software|app|platform|saas|cloud|api|system|cyber|data|ai|ml/
      )
    ) {
      console.log(`💻 Detected DIGITAL domain from project context`);
      return "digital";
    }

    // Finance domain keywords
    if (
      combined.match(
        /finance|bank|payment|transaction|money|investment|trading|fintech|credit|loan/
      )
    ) {
      console.log(`💰 Detected FINANCE domain from project context`);
      return "finance";
    }

    // E-commerce domain keywords
    if (
      combined.match(
        /ecommerce|shop|store|retail|product|inventory|order|shipping|marketplace/
      )
    ) {
      console.log(`🛒 Detected ECOMMERCE domain from project context`);
      return "ecommerce";
    }

    // Education domain keywords
    if (
      combined.match(
        /education|school|university|student|teacher|course|learning|academic/
      )
    ) {
      console.log(`🎓 Detected EDUCATION domain from project context`);
      return "education";
    }

    // Real Estate domain keywords
    if (
      combined.match(
        /real estate|property|housing|rental|lease|apartment|house|building/
      )
    ) {
      console.log(`🏠 Detected REALESTATE domain from project context`);
      return "realestate";
    }

    // Space/Aerospace domain keywords
    if (
      combined.match(
        /space|aerospace|satellite|rocket|mars|moon|planet|cosmic|stellar|orbit/
      )
    ) {
      console.log(`🚀 Detected SPACE domain from project context`);
      return "space";
    }

    // Innovation/Research domain keywords
    if (
      combined.match(
        /innovation|research|experiment|laboratory|breakthrough|discovery|prototype/
      )
    ) {
      console.log(`🔬 Detected INNOVATION domain from project context`);
      return "innovation";
    }

    // Procurement/Supply Chain domain keywords
    if (
      combined.match(
        /procurement|supply|chain|vendor|supplier|logistics|warehouse|inventory/
      )
    ) {
      console.log(`📦 Detected PROCUREMENT domain from project context`);
      return "procurement";
    }

    console.log(
      `❓ No specific domain detected, using generic data generation`
    );
    return null;
  }

  /**
   * Set the domain context manually
   */
  public setDomainContext(domain: DomainType): void {
    this.domainContext = domain;
    console.log(
      `🎯 Domain context manually set to: ${domain?.toUpperCase() || "GENERIC"}`
    );
  }

  /**
   * Get the current domain context
   */
  public getDomainContext(): DomainType {
    return this.domainContext;
  }

  /**
   * Generate a value for a field based on its properties and constraints
   */
  public generateFieldValue(
    field: DatabaseField,
    recordIndex: number,
    tableName: string
  ): string {
    // Set a consistent seed based on record index for reproducible results
    faker.seed(recordIndex * 1000 + field.name.charCodeAt(0));

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

    if (
      fieldType.includes("varchar2") ||
      fieldType.includes("varchar") ||
      fieldType.includes("char") ||
      fieldType.includes("text")
    ) {
      return this.generateStringValue(field, recordIndex, tableName);
    }

    if (
      fieldType.includes("number") ||
      fieldType.includes("int") ||
      fieldType.includes("decimal") ||
      fieldType.includes("float")
    ) {
      return this.generateNumberValue(field, recordIndex);
    }

    if (
      fieldType.includes("timestamp") ||
      fieldType.includes("date") ||
      fieldType.includes("datetime")
    ) {
      return this.generateDateValue(field, recordIndex);
    }

    if (fieldType.includes("boolean") || fieldType.includes("bool")) {
      return faker.datatype.boolean().toString();
    }

    // Default handling
    if (field.nullable) {
      return "NULL";
    }

    return `'DEFAULT_${recordIndex}'`;
  }

  /**
   * Generate string values based on field name and constraints using domain-specific data
   */
  private generateStringValue(
    field: DatabaseField,
    recordIndex: number,
    tableName: string
  ): string {
    const fieldName = field.name.toLowerCase();

    // Special handling for common field names with realistic fake data
    if (fieldName.includes("description")) {
      const desc = this.generateDomainSpecificDescription(recordIndex);
      return `'${desc.replace(/'/g, "''")}'`; // Escape single quotes for SQL
    }

    if (fieldName.includes("name")) {
      const name = this.generateDomainSpecificName(recordIndex);
      return `'${name.replace(/'/g, "''")}'`;
    }

    if (fieldName.includes("title")) {
      const title = this.generateDomainSpecificTitle(recordIndex);
      return `'${title.replace(/'/g, "''")}'`;
    }

    if (fieldName.includes("code")) {
      return this.generateCodeValue(recordIndex, tableName);
    }

    if (fieldName.includes("status")) {
      return this.generateStatusValue(recordIndex);
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
      return this.generateCategoryValue(recordIndex);
    }

    // Default realistic string values
    return this.generateDefaultStringValue(recordIndex);
  }

  /**
   * Generate number values with realistic variation
   */
  private generateNumberValue(
    field: DatabaseField,
    recordIndex: number
  ): string {
    const fieldName = field.name.toLowerCase();

    // Set a consistent seed for reproducible results
    faker.seed(recordIndex * 2000 + fieldName.charCodeAt(0));

    if (fieldName.includes("priority")) {
      return faker.number.int({ min: 1, max: 5 }).toString();
    }

    if (fieldName.includes("quantity") || fieldName.includes("count")) {
      return faker.number.int({ min: 1, max: 250 }).toString();
    }

    if (
      fieldName.includes("amount") ||
      fieldName.includes("price") ||
      fieldName.includes("cost")
    ) {
      const amount = faker.number.float({
        min: 10,
        max: 9999,
        fractionDigits: 2,
      });
      return amount.toString();
    }

    if (fieldName.includes("percentage") || fieldName.includes("percent")) {
      return faker.number.int({ min: 0, max: 100 }).toString();
    }

    if (fieldName.includes("age")) {
      return faker.number.int({ min: 18, max: 95 }).toString();
    }

    if (fieldName.includes("year")) {
      return faker.number.int({ min: 2020, max: 2025 }).toString();
    }

    if (fieldName.includes("month")) {
      return faker.number.int({ min: 1, max: 12 }).toString();
    }

    if (fieldName.includes("day")) {
      return faker.number.int({ min: 1, max: 31 }).toString();
    }

    if (fieldName.includes("rating") || fieldName.includes("score")) {
      return faker.number.int({ min: 1, max: 10 }).toString();
    }

    if (fieldName.includes("weight")) {
      return faker.number.int({ min: 1, max: 1000 }).toString();
    }

    if (fieldName.includes("height")) {
      return faker.number.int({ min: 150, max: 200 }).toString();
    }

    if (fieldName.includes("duration") || fieldName.includes("time")) {
      return faker.number.int({ min: 5, max: 480 }).toString();
    }

    // Default realistic number value
    return faker.number.int({ min: 1, max: 1000 }).toString();
  }

  /**
   * Generate date/timestamp values
   */
  private generateDateValue(field: DatabaseField, recordIndex: number): string {
    const fieldName = field.name.toLowerCase();

    if (
      field.default === "systimestamp" ||
      field.default === "now()" ||
      field.trigger?.enabled
    ) {
      return "CURRENT_TIMESTAMP"; // Database-agnostic current timestamp
    }

    if (fieldName.includes("birth") || fieldName.includes("born")) {
      return `'${faker.date.birthdate().toISOString().split("T")[0]}'`;
    }

    if (fieldName.includes("created") || fieldName.includes("start")) {
      return `'${faker.date.recent({ days: 30 }).toISOString().split("T")[0]}'`;
    }

    if (fieldName.includes("modified") || fieldName.includes("updated")) {
      return `'${faker.date.recent({ days: 7 }).toISOString().split("T")[0]}'`;
    }

    if (fieldName.includes("end") || fieldName.includes("expire")) {
      return `'${faker.date.future().toISOString().split("T")[0]}'`;
    }

    // Default date value
    return `'${faker.date.recent().toISOString().split("T")[0]}'`;
  }

  // Domain-specific generation methods
  private generateDomainSpecificDescription(recordIndex: number): string {
    switch (this.domainContext) {
      case "health":
        return this.generateHealthDescription(recordIndex);
      case "digital":
        return this.generateDigitalDescription(recordIndex);
      case "finance":
        return this.generateFinanceDescription(recordIndex);
      case "ecommerce":
        return this.generateEcommerceDescription(recordIndex);
      case "education":
        return this.generateEducationDescription(recordIndex);
      case "realestate":
        return this.generateRealEstateDescription(recordIndex);
      case "space":
        return this.generateSpaceDescription(recordIndex);
      case "innovation":
        return this.generateInnovationDescription(recordIndex);
      case "procurement":
        return this.generateProcurementDescription(recordIndex);
      default:
        return this.generateGenericDescription(recordIndex);
    }
  }

  private generateDomainSpecificName(recordIndex: number): string {
    switch (this.domainContext) {
      case "health":
        const healthNames = [
          faker.person.fullName(),
          `Dr. ${faker.person.lastName()} Medical Center`,
          `${faker.location.city()} General Hospital`,
          `${faker.science.chemicalElement().name} Pharmaceuticals`,
          `${faker.lorem.word()} Health Clinic`,
        ];
        return healthNames[recordIndex % healthNames.length];

      case "digital":
        const digitalNames = [
          `${faker.hacker.adjective()} ${faker.hacker.noun()} Inc`,
          `${faker.company.buzzNoun()} Tech Solutions`,
          `${faker.lorem.word()} Software Labs`,
          `${
            faker.hacker.verb().charAt(0).toUpperCase() +
            faker.hacker.verb().slice(1)
          } Systems`,
          `Cloud${
            faker.lorem.word().charAt(0).toUpperCase() +
            faker.lorem.word().slice(1)
          }`,
        ];
        return digitalNames[recordIndex % digitalNames.length];

      case "finance":
        const financeNames = [
          `${faker.location.city()} Financial Group`,
          `${faker.person.lastName()} Investment Bank`,
          `${faker.commerce.productAdjective()} Capital Management`,
          `${faker.lorem.word()} Credit Union`,
          `${faker.finance.accountName()}`,
        ];
        return financeNames[recordIndex % financeNames.length];

      case "ecommerce":
        const ecommerceNames = [
          faker.commerce.productName(),
          `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
          `${faker.color.human()} ${faker.commerce.productMaterial()} Co`,
          faker.company.name(),
          `${faker.lorem.word()} Marketplace`,
        ];
        return ecommerceNames[recordIndex % ecommerceNames.length];

      case "education":
        const educationNames = [
          `${faker.location.city()} University`,
          `${faker.person.lastName()} Academy`,
          `${faker.lorem.word()} Learning Center`,
          `${faker.company.buzzAdjective()} Institute`,
          faker.person.fullName(),
        ];
        return educationNames[recordIndex % educationNames.length];

      case "realestate":
        const realEstateNames = [
          `${faker.location.street()} Properties`,
          `${faker.person.lastName()} Realty Group`,
          `${faker.location.city()} Development Corp`,
          `${faker.commerce.productAdjective()} Estates`,
          `${faker.location.direction()} ${faker.lorem.word()} Holdings`,
        ];
        return realEstateNames[recordIndex % realEstateNames.length];

      case "space":
        const spaceNames = [
          `${faker.science.chemicalElement().name} Space Systems`,
          `${faker.location.city()} Aerospace Corporation`,
          `Orbital ${faker.lorem.word()} Industries`,
          `${faker.person.lastName()} Space Technologies`,
          `Stellar ${faker.commerce.productAdjective()} Solutions`,
        ];
        return spaceNames[recordIndex % spaceNames.length];

      case "innovation":
        const innovationNames = [
          `${faker.lorem.word()} Research Labs`,
          `${faker.person.lastName()} Innovation Center`,
          `Advanced ${faker.science.chemicalElement().name} Institute`,
          `${faker.location.city()} Technology Hub`,
          `Future ${faker.commerce.productAdjective()} Solutions`,
        ];
        return innovationNames[recordIndex % innovationNames.length];

      case "procurement":
        const procurementNames = [
          `${faker.location.city()} Supply Solutions`,
          `${faker.person.lastName()} Procurement Services`,
          `Global ${faker.commerce.productAdjective()} Logistics`,
          `${faker.lorem.word()} Vendor Management`,
          `Strategic Sourcing Partners`,
        ];
        return procurementNames[recordIndex % procurementNames.length];

      default:
        const genericNames = [
          faker.person.fullName(),
          faker.company.name(),
          faker.commerce.productName(),
          `${faker.color.human()} ${faker.animal.type()}`,
          faker.music.songName(),
        ];
        return genericNames[recordIndex % genericNames.length];
    }
  }

  private generateDomainSpecificTitle(recordIndex: number): string {
    switch (this.domainContext) {
      case "health":
        const healthTitles = [
          `${faker.person.jobTitle()} in Healthcare`,
          `Medical ${faker.lorem.word()} Specialist`,
          `Chief ${faker.lorem.word()} Officer`,
          `Senior Healthcare Analyst`,
          `Medical Research Director`,
        ];
        return healthTitles[recordIndex % healthTitles.length];

      case "digital":
        const digitalTitles = [
          faker.person.jobTitle(),
          `${faker.hacker.adjective()} ${faker.hacker.noun()} Engineer`,
          `Senior ${faker.lorem.word()} Developer`,
          `Tech Lead - ${faker.hacker.noun()}`,
          `${faker.company.buzzAdjective()} Architect`,
        ];
        return digitalTitles[recordIndex % digitalTitles.length];

      default:
        const genericTitles = [
          faker.person.jobTitle(),
          faker.book.title(),
          faker.lorem.words({ min: 2, max: 4 }),
          faker.company.buzzPhrase(),
          `${
            faker.science.chemicalElement().name
          } ${faker.commerce.department()}`,
        ];
        return genericTitles[recordIndex % genericTitles.length];
    }
  }

  // Utility generation methods
  private generateCodeValue(recordIndex: number, tableName: string): string {
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
    return `'${codes[recordIndex % codes.length]}'`;
  }

  private generateStatusValue(recordIndex: number): string {
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
    return `'${statuses[(recordIndex - 1) % statuses.length]}'`;
  }

  private generateCategoryValue(recordIndex: number): string {
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

  private generateDefaultStringValue(recordIndex: number): string {
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

  // Domain-specific description generators
  private generateHealthDescription(recordIndex: number): string {
    const descriptions = [
      `${
        faker.science.chemicalElement().name
      } compound for treating ${faker.lorem.word()}`,
      `Advanced ${faker.lorem.word()} therapy for patient care`,
      `Medical device for ${faker.science.unit().name} measurement`,
      `Pharmaceutical treatment for ${faker.lorem.word()} conditions`,
      `Clinical study on ${faker.science.chemicalElement().name} effectiveness`,
      `Patient monitoring system for vital signs`,
      `Surgical instrument for precision procedures`,
      `Diagnostic tool for early detection`,
      `Therapeutic intervention for chronic conditions`,
      `Healthcare protocol for emergency response`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateDigitalDescription(recordIndex: number): string {
    const descriptions = [
      `${faker.hacker.adjective()} ${faker.hacker.noun()} API endpoint`,
      `Cloud-native ${faker.hacker.phrase()}`,
      `Machine learning model for ${faker.hacker.noun()} prediction`,
      `Microservice architecture for ${faker.hacker.verb()} operations`,
      `Real-time analytics dashboard for ${faker.hacker.noun()}`,
      `Blockchain-based ${faker.hacker.noun()} platform`,
      `AI-powered ${faker.hacker.adjective()} system`,
      `DevOps pipeline for continuous integration`,
      `Serverless function for data processing`,
      `IoT sensor network for monitoring`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateFinanceDescription(recordIndex: number): string {
    const descriptions = [
      `${faker.finance.transactionType()} processing system`,
      `Investment portfolio for ${faker.company.name()}`,
      `Risk assessment model for ${faker.finance.accountName()}`,
      `Payment gateway integration service`,
      `Cryptocurrency trading algorithm`,
      `Credit scoring mechanism`,
      `Fraud detection system`,
      `Automated lending platform`,
      `Financial compliance monitoring`,
      `Tax calculation service`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateEcommerceDescription(recordIndex: number): string {
    const descriptions = [
      `Premium ${faker.commerce.productName()} with enhanced features`,
      `${faker.commerce.productAdjective()} ${faker.commerce.product()} for modern lifestyle`,
      `Eco-friendly ${faker.commerce.productMaterial()} product`,
      `Limited edition ${faker.commerce.productName()}`,
      `Professional-grade ${faker.commerce.product()} equipment`,
      `Handcrafted ${faker.commerce.productMaterial()} accessories`,
      `Smart ${faker.commerce.product()} with IoT connectivity`,
      `Sustainable ${faker.commerce.productName()} solution`,
      `Luxury ${faker.commerce.productAdjective()} collection`,
      `Innovative ${faker.commerce.product()} design`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateEducationDescription(recordIndex: number): string {
    const descriptions = [
      `Advanced course in ${faker.lorem.word()} studies`,
      `Interactive learning module for ${faker.lorem.words(2)}`,
      `Educational resource for ${faker.person.jobArea()} development`,
      `Online certification program`,
      `Collaborative project-based learning`,
      `Assessment tool for skill evaluation`,
      `Virtual classroom environment`,
      `Educational game for enhanced engagement`,
      `Research methodology for academic excellence`,
      `Professional development workshop`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateRealEstateDescription(recordIndex: number): string {
    const descriptions = [
      `Luxurious ${faker.number.int({
        min: 1,
        max: 5,
      })}-bedroom property in ${faker.location.city()}`,
      `Modern apartment with ${faker.lorem.word()} amenities`,
      `Commercial space suitable for ${faker.company.buzzNoun()} business`,
      `Historic building with architectural significance`,
      `Eco-friendly residential complex`,
      `Prime location property with city views`,
      `Renovated office space in business district`,
      `Waterfront property with private access`,
      `Family-friendly neighborhood residence`,
      `Investment opportunity in growing area`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateSpaceDescription(recordIndex: number): string {
    const descriptions = [
      `Advanced ${faker.science.chemicalElement().name} propulsion system`,
      `Orbital satellite for ${faker.lorem.word()} monitoring`,
      `Deep space exploration mission to ${
        faker.science.chemicalElement().name
      } sector`,
      `Interplanetary communication relay station`,
      `Asteroid mining equipment for rare minerals`,
      `Space habitat life support system`,
      `Solar panel array for orbital installations`,
      `Spacecraft navigation and guidance system`,
      `Extraterrestrial research laboratory module`,
      `Cosmic radiation shielding technology`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateInnovationDescription(recordIndex: number): string {
    const descriptions = [
      `Breakthrough research in ${
        faker.science.chemicalElement().name
      } applications`,
      `Experimental prototype for ${faker.lorem.word()} enhancement`,
      `Innovative solution using ${faker.science.unit().name} technology`,
      `Research initiative for sustainable development`,
      `Laboratory experiment on molecular structures`,
      `Patent-pending invention for industrial use`,
      `Cutting-edge discovery in materials science`,
      `Revolutionary approach to energy efficiency`,
      `Next-generation technology platform`,
      `Pioneering research in quantum mechanics`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateProcurementDescription(recordIndex: number): string {
    const descriptions = [
      `Vendor agreement for ${faker.commerce.productName()} supply`,
      `Strategic sourcing initiative for cost optimization`,
      `Supply chain management system integration`,
      `Procurement contract for ${faker.lorem.word()} services`,
      `Supplier performance evaluation metrics`,
      `Inventory management solution for warehouses`,
      `Logistics optimization for global distribution`,
      `Contract negotiation for bulk purchasing`,
      `Vendor onboarding and compliance process`,
      `Supply risk assessment and mitigation plan`,
    ];
    return descriptions[recordIndex % descriptions.length];
  }

  private generateGenericDescription(recordIndex: number): string {
    const descriptions = [
      faker.lorem.sentence({ min: 4, max: 8 }),
      faker.company.catchPhrase(),
      faker.hacker.phrase(),
      `${faker.color.human()} ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`,
      faker.commerce.productDescription(),
    ];
    return descriptions[recordIndex % descriptions.length];
  }
}
