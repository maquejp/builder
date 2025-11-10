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

    // Finance domain keywords (check before digital to avoid false positives)
    if (
      combined.match(
        /finance|bank|payment|transaction|money|investment|trading|fintech|credit|loan|financial/
      )
    ) {
      console.log(`💰 Detected FINANCE domain from project context`);
      return "finance";
    }

    // E-commerce domain keywords
    if (
      combined.match(
        /ecommerce|shop|store|retail|product|inventory|order|shipping|marketplace|shopping/
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
        /space|aerospace|satellite|rocket|mars|moon|planet|cosmic|stellar|orbit|spacetech/
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

    // Digital/Tech domain keywords (keep last as it's more generic)
    if (
      combined.match(
        /digital|tech|software|app|platform|saas|cloud|api|system|cyber|data|ai|ml/
      )
    ) {
      console.log(`💻 Detected DIGITAL domain from project context`);
      return "digital";
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
    const templates = [
      () =>
        `${
          faker.science.chemicalElement().name
        } compound for treating ${faker.lorem.word()} conditions`,
      () =>
        `Advanced ${faker.lorem.word()} therapy for ${faker.helpers.arrayElement(
          [
            "patient care",
            "medical treatment",
            "healthcare management",
            "clinical intervention",
          ]
        )}`,
      () =>
        `Medical device for ${
          faker.science.unit().name
        } measurement and ${faker.helpers.arrayElement([
          "monitoring",
          "analysis",
          "diagnosis",
          "treatment",
        ])}`,
      () =>
        `Pharmaceutical ${faker.helpers.arrayElement([
          "treatment",
          "solution",
          "medication",
          "therapy",
        ])} for ${faker.lorem.word()} disorders`,
      () =>
        `Clinical ${faker.helpers.arrayElement([
          "study",
          "trial",
          "research",
          "investigation",
        ])} on ${
          faker.science.chemicalElement().name
        } effectiveness in ${faker.lorem.word()} treatment`,
      () =>
        `${faker.helpers.arrayElement([
          "Patient monitoring",
          "Diagnostic",
          "Therapeutic",
          "Surgical",
        ])} system for ${faker.helpers.arrayElement([
          "vital signs",
          "health metrics",
          "medical parameters",
          "clinical indicators",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Innovative",
          "Advanced",
          "State-of-the-art",
          "Next-generation",
        ])} ${faker.helpers.arrayElement([
          "surgical instrument",
          "medical device",
          "diagnostic tool",
          "therapeutic equipment",
        ])} for ${faker.helpers.arrayElement([
          "precision procedures",
          "accurate diagnosis",
          "effective treatment",
          "patient safety",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Breakthrough",
          "Revolutionary",
          "Cutting-edge",
          "Pioneering",
        ])} ${faker.helpers.arrayElement([
          "intervention",
          "approach",
          "methodology",
          "technique",
        ])} for ${faker.helpers.arrayElement([
          "chronic conditions",
          "acute disorders",
          "preventive care",
          "rehabilitation",
        ])}`,
      () =>
        `Healthcare ${faker.helpers.arrayElement([
          "protocol",
          "framework",
          "system",
          "solution",
        ])} for ${faker.helpers.arrayElement([
          "emergency response",
          "critical care",
          "patient management",
          "clinical workflow",
        ])} optimization`,
      () =>
        `${faker.helpers.arrayElement([
          "Digital",
          "AI-powered",
          "Smart",
          "Automated",
        ])} health platform for ${faker.helpers.arrayElement([
          "remote monitoring",
          "telemedicine",
          "health analytics",
          "patient engagement",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateDigitalDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.hacker.adjective()} ${faker.hacker.noun()} ${faker.helpers.arrayElement(
          [
            "API endpoint",
            "service layer",
            "data interface",
            "integration point",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Cloud-native",
          "Serverless",
          "Containerized",
          "Microservice-based",
        ])} ${faker.hacker.phrase()} ${faker.helpers.arrayElement([
          "architecture",
          "framework",
          "solution",
          "platform",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Machine learning",
          "Deep learning",
          "Neural network",
          "AI",
        ])} model for ${faker.hacker.noun()} ${faker.helpers.arrayElement([
          "prediction",
          "classification",
          "optimization",
          "automation",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Distributed",
          "Scalable",
          "High-performance",
          "Fault-tolerant",
        ])} ${faker.helpers.arrayElement([
          "microservice",
          "system",
          "infrastructure",
        ])} architecture for ${faker.hacker.verb()} operations`,
      () =>
        `Real-time ${faker.helpers.arrayElement([
          "analytics",
          "monitoring",
          "processing",
          "streaming",
        ])} ${faker.helpers.arrayElement([
          "dashboard",
          "platform",
          "engine",
          "system",
        ])} for ${faker.hacker.noun()} ${faker.helpers.arrayElement([
          "insights",
          "metrics",
          "data",
          "intelligence",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Blockchain-based",
          "Distributed ledger",
          "Decentralized",
          "Smart contract",
        ])} ${faker.hacker.noun()} platform with ${faker.helpers.arrayElement([
          "immutable records",
          "consensus mechanisms",
          "cryptographic security",
          "peer-to-peer networking",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "AI-powered",
          "ML-driven",
          "Intelligent",
          "Autonomous",
        ])} ${faker.hacker.adjective()} system for ${faker.helpers.arrayElement(
          [
            "automated decision making",
            "predictive analytics",
            "cognitive processing",
            "smart automation",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "CI/CD",
          "DevOps",
          "GitOps",
          "Infrastructure as Code",
        ])} pipeline for ${faker.helpers.arrayElement([
          "continuous integration",
          "automated deployment",
          "infrastructure management",
          "release orchestration",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Serverless",
          "Edge computing",
          "Lambda",
          "Function-as-a-Service",
        ])} function for ${faker.helpers.arrayElement([
          "data processing",
          "event handling",
          "API gateway",
          "real-time computation",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "IoT",
          "Edge device",
          "Sensor",
          "Smart device",
        ])} network for ${faker.helpers.arrayElement([
          "environmental monitoring",
          "predictive maintenance",
          "asset tracking",
          "performance optimization",
        ])} with ${faker.helpers.arrayElement([
          "MQTT protocol",
          "wireless connectivity",
          "cloud integration",
          "data aggregation",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateFinanceDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.finance.transactionType()} processing system with ${faker.helpers.arrayElement(
          [
            "real-time validation",
            "fraud detection",
            "automated reconciliation",
            "regulatory compliance",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Diversified",
          "Strategic",
          "Balanced",
          "Growth-oriented",
        ])} investment portfolio for ${faker.company.name()} with ${faker.helpers.arrayElement(
          [
            "risk management",
            "performance tracking",
            "automated rebalancing",
            "ESG compliance",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Machine learning-based",
          "Predictive",
          "Multi-factor",
        ])} risk assessment model for ${faker.finance.accountName()} ${faker.helpers.arrayElement(
          [
            "credit evaluation",
            "market analysis",
            "portfolio optimization",
            "regulatory reporting",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Secure",
          "Multi-channel",
          "API-driven",
          "PCI-compliant",
        ])} payment gateway integration service supporting ${faker.helpers.arrayElement(
          [
            "multiple currencies",
            "instant settlements",
            "fraud prevention",
            "mobile payments",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Algorithmic",
          "High-frequency",
          "AI-powered",
          "Quantitative",
        ])} ${faker.helpers.arrayElement([
          "cryptocurrency",
          "forex",
          "commodities",
          "equity",
        ])} trading ${faker.helpers.arrayElement([
          "algorithm",
          "bot",
          "system",
          "platform",
        ])} with ${faker.helpers.arrayElement([
          "backtesting capabilities",
          "risk controls",
          "performance analytics",
          "market data integration",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Machine learning",
          "Statistical",
          "Behavioral",
          "Alternative data",
        ])} credit scoring ${faker.helpers.arrayElement([
          "mechanism",
          "model",
          "engine",
          "framework",
        ])} for ${faker.helpers.arrayElement([
          "loan underwriting",
          "risk assessment",
          "decision automation",
          "regulatory compliance",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Real-time",
          "AI-powered",
          "Pattern-based",
          "Multi-layered",
        ])} fraud detection system with ${faker.helpers.arrayElement([
          "anomaly detection",
          "transaction monitoring",
          "behavioral analysis",
          "risk scoring",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Automated",
          "Digital-first",
          "API-driven",
          "Cloud-based",
        ])} lending platform featuring ${faker.helpers.arrayElement([
          "instant approvals",
          "credit decisioning",
          "document processing",
          "loan origination",
        ])}`,
      () =>
        `Financial compliance monitoring ${faker.helpers.arrayElement([
          "system",
          "platform",
          "solution",
          "framework",
        ])} for ${faker.helpers.arrayElement([
          "regulatory reporting",
          "AML screening",
          "KYC verification",
          "audit trail management",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Automated",
          "Multi-jurisdiction",
          "Real-time",
          "AI-assisted",
        ])} tax calculation service with ${faker.helpers.arrayElement([
          "regulatory updates",
          "filing automation",
          "audit support",
          "compliance tracking",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateEcommerceDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Premium",
          "Luxury",
          "High-end",
          "Elite",
        ])} ${faker.commerce.productName()} with ${faker.helpers.arrayElement([
          "enhanced features",
          "advanced functionality",
          "superior performance",
          "innovative design",
          "premium materials",
        ])}`,
      () =>
        `${faker.commerce.productAdjective()} ${faker.commerce.product()} ${faker.helpers.arrayElement(
          [
            "for modern lifestyle",
            "designed for professionals",
            "perfect for everyday use",
            "ideal for active individuals",
            "crafted for discerning customers",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Eco-friendly",
          "Sustainable",
          "Environmentally conscious",
          "Green",
          "Carbon-neutral",
        ])} ${faker.commerce.productMaterial()} product with ${faker.helpers.arrayElement(
          [
            "recyclable packaging",
            "minimal environmental impact",
            "sustainable sourcing",
            "biodegradable components",
            "zero-waste manufacturing",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Limited edition",
          "Exclusive",
          "Special release",
          "Collector's",
          "Artist collaboration",
        ])} ${faker.commerce.productName()} ${faker.helpers.arrayElement([
          "featuring unique design elements",
          "with premium finishing",
          "including exclusive accessories",
          "crafted in small batches",
          "with certificate of authenticity",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Professional-grade",
          "Commercial-quality",
          "Industrial-strength",
          "Enterprise-level",
        ])} ${faker.commerce.product()} equipment ${faker.helpers.arrayElement([
          "built for durability",
          "designed for heavy use",
          "engineered for precision",
          "optimized for performance",
          "certified for professional use",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Handcrafted",
          "Artisanal",
          "Hand-made",
          "Bespoke",
          "Custom-made",
        ])} ${faker.commerce.productMaterial()} accessories ${faker.helpers.arrayElement(
          [
            "by skilled artisans",
            "using traditional techniques",
            "with attention to detail",
            "from premium materials",
            "with personalization options",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Smart",
          "Connected",
          "IoT-enabled",
          "WiFi-connected",
          "App-controlled",
        ])} ${faker.commerce.product()} with ${faker.helpers.arrayElement([
          "IoT connectivity",
          "mobile app integration",
          "voice control support",
          "automation features",
          "real-time monitoring",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Sustainable",
          "Ethical",
          "Fair-trade",
          "Organic",
          "Responsible",
        ])} ${faker.commerce.productName()} solution ${faker.helpers.arrayElement(
          [
            "supporting local communities",
            "with transparent supply chain",
            "certified by environmental standards",
            "promoting social responsibility",
            "contributing to sustainability goals",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Luxury",
          "Designer",
          "High-fashion",
          "Couture",
          "Exclusive",
        ])} ${faker.commerce.productAdjective()} collection ${faker.helpers.arrayElement(
          [
            "inspired by contemporary trends",
            "featuring timeless elegance",
            "with sophisticated styling",
            "showcasing premium craftsmanship",
            "representing modern luxury",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Innovative",
          "Revolutionary",
          "Cutting-edge",
          "Next-generation",
          "Breakthrough",
        ])} ${faker.commerce.product()} design ${faker.helpers.arrayElement([
          "incorporating latest technology",
          "featuring patented innovations",
          "with user-centric approach",
          "setting new industry standards",
          "redefining product categories",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateEducationDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Comprehensive",
          "Specialized",
          "Graduate-level",
          "Intensive",
        ])} course in ${faker.lorem.word()} studies with ${faker.helpers.arrayElement(
          [
            "practical applications",
            "real-world case studies",
            "industry partnerships",
            "hands-on projects",
            "expert instruction",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Interactive",
          "Multimedia",
          "Adaptive",
          "Gamified",
          "Self-paced",
        ])} learning module for ${faker.lorem.words(
          2
        )} ${faker.helpers.arrayElement([
          "featuring video lectures",
          "with interactive exercises",
          "including virtual labs",
          "offering peer collaboration",
          "providing instant feedback",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "Evidence-based",
          "Industry-aligned",
          "Skill-focused",
        ])} educational resource for ${faker.person.jobArea()} development ${faker.helpers.arrayElement(
          [
            "with certification pathway",
            "including mentorship program",
            "featuring industry experts",
            "offering career guidance",
            "providing networking opportunities",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Accredited",
          "Professional",
          "Industry-recognized",
          "Competency-based",
        ])} online certification program ${faker.helpers.arrayElement([
          "with flexible scheduling",
          "featuring expert instructors",
          "including practical assessments",
          "offering career support",
          "providing digital credentials",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Collaborative",
          "Team-based",
          "Peer-to-peer",
          "Community-driven",
        ])} project-based learning ${faker.helpers.arrayElement([
          "fostering critical thinking",
          "developing problem-solving skills",
          "encouraging innovation",
          "building leadership abilities",
          "promoting teamwork",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "AI-powered",
          "Adaptive",
          "Multi-dimensional",
        ])} assessment tool for ${faker.helpers.arrayElement([
          "skill evaluation",
          "competency measurement",
          "learning progress tracking",
          "performance analysis",
          "personalized feedback",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Immersive",
          "Interactive",
          "Technology-enhanced",
          "Cloud-based",
        ])} virtual classroom environment ${faker.helpers.arrayElement([
          "supporting global collaboration",
          "enabling real-time interaction",
          "featuring multimedia content",
          "providing accessibility options",
          "offering recording capabilities",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Engaging",
          "Immersive",
          "Story-driven",
          "Reward-based",
        ])} educational game for ${faker.helpers.arrayElement([
          "enhanced engagement",
          "improved retention",
          "skill development",
          "knowledge reinforcement",
          "motivational learning",
        ])} ${faker.helpers.arrayElement([
          "using gamification principles",
          "with progress tracking",
          "featuring competitive elements",
          "including achievement systems",
          "promoting active participation",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Evidence-based",
          "Systematic",
          "Interdisciplinary",
          "Innovation-focused",
        ])} research methodology for ${faker.helpers.arrayElement([
          "academic excellence",
          "scholarly inquiry",
          "knowledge creation",
          "scientific discovery",
          "educational advancement",
        ])} ${faker.helpers.arrayElement([
          "with peer review process",
          "including data analysis tools",
          "featuring publication support",
          "offering research ethics training",
          "providing statistical guidance",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Intensive",
          "Hands-on",
          "Industry-led",
          "Skill-building",
        ])} professional development workshop ${faker.helpers.arrayElement([
          "led by industry experts",
          "featuring practical exercises",
          "including networking opportunities",
          "with certification options",
          "offering continued learning support",
        ])} for ${faker.helpers.arrayElement([
          "career advancement",
          "skill enhancement",
          "leadership development",
          "technical proficiency",
          "professional growth",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateRealEstateDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Luxurious",
          "Elegant",
          "Spacious",
          "Contemporary",
          "Executive",
        ])} ${faker.number.int({
          min: 1,
          max: 5,
        })}-bedroom property in ${faker.location.city()} ${faker.helpers.arrayElement(
          [
            "with panoramic views",
            "featuring premium finishes",
            "including private amenities",
            "offering exclusive access",
            "with custom design elements",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Modern",
          "Ultra-modern",
          "Designer",
          "Boutique",
          "High-rise",
        ])} apartment with ${faker.lorem.word()} amenities ${faker.helpers.arrayElement(
          [
            "and rooftop terrace",
            "including concierge services",
            "featuring smart home technology",
            "with fitness center access",
            "offering 24/7 security",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Prime",
          "Strategic",
          "High-visibility",
          "Flexible",
          "Turn-key",
        ])} commercial space suitable for ${faker.company.buzzNoun()} business ${faker.helpers.arrayElement(
          [
            "with high foot traffic",
            "including parking facilities",
            "featuring modern infrastructure",
            "offering expansion possibilities",
            "with established client base",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Historic",
          "Heritage",
          "Landmark",
          "Restored",
          "Architecturally significant",
        ])} building with ${faker.helpers.arrayElement([
          "architectural significance",
          "cultural heritage value",
          "period features",
          "unique character",
          "historical importance",
        ])} ${faker.helpers.arrayElement([
          "and modern upgrades",
          "featuring original details",
          "including preservation elements",
          "with adaptive use potential",
          "offering investment value",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Eco-friendly",
          "Sustainable",
          "Green-certified",
          "Energy-efficient",
          "LEED-certified",
        ])} residential complex ${faker.helpers.arrayElement([
          "with solar panels",
          "featuring green spaces",
          "including electric vehicle charging",
          "offering rainwater harvesting",
          "with geothermal heating",
        ])} ${faker.helpers.arrayElement([
          "and community gardens",
          "promoting sustainable living",
          "reducing environmental impact",
          "supporting eco-conscious lifestyle",
          "achieving carbon neutrality",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Prime location",
          "Prestigious",
          "Coveted",
          "Central",
          "Exclusive",
        ])} property with ${faker.helpers.arrayElement([
          "city views",
          "waterfront access",
          "mountain vistas",
          "park adjacency",
          "skyline panorama",
        ])} ${faker.helpers.arrayElement([
          "and premium amenities",
          "featuring concierge services",
          "including valet parking",
          "offering resort-style facilities",
          "with private elevators",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Renovated",
          "Fully modernized",
          "State-of-the-art",
          "Contemporary",
          "Designer",
        ])} office space in ${faker.helpers.arrayElement([
          "business district",
          "financial center",
          "tech hub",
          "corporate corridor",
          "commercial zone",
        ])} ${faker.helpers.arrayElement([
          "with flexible layouts",
          "featuring latest technology",
          "including conference facilities",
          "offering networking opportunities",
          "with sustainability features",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Waterfront",
          "Lakefront",
          "Oceanfront",
          "Riverside",
          "Beachfront",
        ])} property with ${faker.helpers.arrayElement([
          "private access",
          "dock facilities",
          "panoramic water views",
          "beach privileges",
          "marina rights",
        ])} ${faker.helpers.arrayElement([
          "and outdoor entertainment areas",
          "featuring infinity pool",
          "including guest quarters",
          "offering water sports access",
          "with sunset exposures",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Family-friendly",
          "Child-safe",
          "Quiet",
          "Residential",
          "Community-oriented",
        ])} neighborhood residence ${faker.helpers.arrayElement([
          "near top schools",
          "with playground access",
          "including community amenities",
          "offering safe environment",
          "featuring family facilities",
        ])} ${faker.helpers.arrayElement([
          "and walking trails",
          "with park proximity",
          "including recreation centers",
          "offering youth programs",
          "supporting active lifestyle",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Investment",
          "Development",
          "Commercial",
          "Mixed-use",
          "Income-generating",
        ])} opportunity in ${faker.helpers.arrayElement([
          "growing area",
          "emerging district",
          "revitalization zone",
          "economic development area",
          "up-and-coming neighborhood",
        ])} ${faker.helpers.arrayElement([
          "with strong rental demand",
          "featuring appreciation potential",
          "including tax incentives",
          "offering development rights",
          "with infrastructure improvements",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateSpaceDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Next-generation",
          "Revolutionary",
          "High-efficiency",
          "Cutting-edge",
        ])} ${
          faker.science.chemicalElement().name
        } propulsion system ${faker.helpers.arrayElement([
          "for deep space missions",
          "with variable thrust capability",
          "featuring ion drive technology",
          "optimized for long-duration flights",
          "designed for interplanetary travel",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Orbital",
          "Geostationary",
          "Low Earth orbit",
          "Polar",
          "Sun-synchronous",
        ])} satellite for ${faker.lorem.word()} monitoring ${faker.helpers.arrayElement(
          [
            "with real-time data transmission",
            "featuring high-resolution imaging",
            "including autonomous operation",
            "offering global coverage",
            "with extended mission duration",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Deep space",
          "Interstellar",
          "Long-range",
          "Robotic",
          "Unmanned",
        ])} exploration mission to ${
          faker.science.chemicalElement().name
        } sector ${faker.helpers.arrayElement([
          "with advanced instrumentation",
          "featuring sample collection capability",
          "including communication relay",
          "offering scientific discovery potential",
          "with autonomous navigation",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Interplanetary",
          "Deep space",
          "High-gain",
          "Quantum",
          "Multi-frequency",
        ])} communication relay station ${faker.helpers.arrayElement([
          "with laser communication links",
          "featuring redundant systems",
          "including signal amplification",
          "offering secure transmission",
          "with adaptive protocols",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Autonomous",
          "Robotic",
          "AI-controlled",
          "Remote-operated",
          "Precision",
        ])} asteroid mining equipment for ${faker.helpers.arrayElement([
          "rare minerals",
          "precious metals",
          "rare earth elements",
          "water extraction",
          "resource harvesting",
        ])} ${faker.helpers.arrayElement([
          "with zero-g operation capability",
          "featuring containment systems",
          "including processing modules",
          "offering sustainable extraction",
          "with minimal environmental impact",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Closed-loop",
          "Regenerative",
          "Automated",
          "Redundant",
          "Bio-regenerative",
        ])} space habitat life support system ${faker.helpers.arrayElement([
          "with atmospheric recycling",
          "featuring water recovery",
          "including food production",
          "offering crew safety",
          "with emergency backup systems",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "High-efficiency",
          "Flexible",
          "Deployable",
          "Lightweight",
          "Concentrator",
        ])} solar panel array for ${faker.helpers.arrayElement([
          "orbital installations",
          "space stations",
          "satellite power",
          "deep space missions",
          "lunar operations",
        ])} ${faker.helpers.arrayElement([
          "with tracking mechanisms",
          "featuring radiation resistance",
          "including power management",
          "offering extended lifespan",
          "with maintenance-free operation",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Precision",
          "Autonomous",
          "AI-assisted",
          "Multi-sensor",
          "Inertial",
        ])} spacecraft navigation and guidance system ${faker.helpers.arrayElement(
          [
            "with star tracker integration",
            "featuring gyroscopic stabilization",
            "including trajectory optimization",
            "offering autonomous docking",
            "with collision avoidance",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Modular",
          "Pressurized",
          "Multi-purpose",
          "Expandable",
          "Research-dedicated",
        ])} extraterrestrial research laboratory module ${faker.helpers.arrayElement(
          [
            "with clean room facilities",
            "featuring sample analysis capability",
            "including data storage systems",
            "offering remote operation",
            "with contamination prevention",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Multi-layer",
          "Adaptive",
          "Electromagnetic",
          "Particle",
        ])} cosmic radiation shielding technology ${faker.helpers.arrayElement([
          "with active protection systems",
          "featuring material optimization",
          "including health monitoring",
          "offering crew protection",
          "with minimal weight penalty",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateInnovationDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Breakthrough",
          "Groundbreaking",
          "Revolutionary",
          "Pioneering",
          "Cutting-edge",
        ])} research in ${
          faker.science.chemicalElement().name
        } applications ${faker.helpers.arrayElement([
          "with commercial potential",
          "for industrial transformation",
          "advancing scientific knowledge",
          "solving global challenges",
          "creating new possibilities",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Experimental",
          "Proof-of-concept",
          "Beta",
          "Advanced",
          "Next-generation",
        ])} prototype for ${faker.lorem.word()} enhancement ${faker.helpers.arrayElement(
          [
            "with scalability potential",
            "featuring novel approaches",
            "incorporating latest research",
            "addressing market needs",
            "pushing technological boundaries",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Innovative",
          "Disruptive",
          "Novel",
          "Game-changing",
          "Transformative",
        ])} solution using ${
          faker.science.unit().name
        } technology ${faker.helpers.arrayElement([
          "for efficiency optimization",
          "with sustainable design",
          "featuring automation capabilities",
          "offering cost reduction",
          "enabling new applications",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Cross-disciplinary",
          "Collaborative",
          "Global",
          "Long-term",
          "Impact-driven",
        ])} research initiative for ${faker.helpers.arrayElement([
          "sustainable development",
          "environmental protection",
          "social innovation",
          "economic growth",
          "technological advancement",
        ])} ${faker.helpers.arrayElement([
          "with stakeholder engagement",
          "featuring open-source principles",
          "including community participation",
          "offering scalable solutions",
          "promoting knowledge sharing",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Controlled",
          "Multi-phase",
          "Interdisciplinary",
          "Collaborative",
        ])} laboratory experiment on ${faker.helpers.arrayElement([
          "molecular structures",
          "quantum phenomena",
          "biological systems",
          "material properties",
          "chemical reactions",
        ])} ${faker.helpers.arrayElement([
          "with precision measurement",
          "featuring novel methodologies",
          "including peer review",
          "offering reproducible results",
          "advancing theoretical understanding",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Patent-pending",
          "Proprietary",
          "Breakthrough",
          "Disruptive",
          "First-of-its-kind",
        ])} invention for ${faker.helpers.arrayElement([
          "industrial use",
          "commercial application",
          "consumer markets",
          "healthcare solutions",
          "environmental remediation",
        ])} ${faker.helpers.arrayElement([
          "with competitive advantages",
          "featuring cost-effectiveness",
          "including safety improvements",
          "offering performance benefits",
          "enabling new business models",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Cutting-edge",
          "Paradigm-shifting",
          "Fundamental",
          "Interdisciplinary",
          "Breakthrough",
        ])} discovery in ${faker.helpers.arrayElement([
          "materials science",
          "nanotechnology",
          "biotechnology",
          "quantum physics",
          "computational science",
        ])} ${faker.helpers.arrayElement([
          "with broad applications",
          "challenging existing theories",
          "opening new research avenues",
          "enabling technological leaps",
          "transforming scientific understanding",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Revolutionary",
          "Sustainable",
          "Efficient",
          "Innovative",
          "Scalable",
        ])} approach to ${faker.helpers.arrayElement([
          "energy efficiency",
          "resource optimization",
          "waste reduction",
          "carbon neutrality",
          "renewable energy",
        ])} ${faker.helpers.arrayElement([
          "with measurable impact",
          "featuring cost savings",
          "including environmental benefits",
          "offering global scalability",
          "promoting circular economy",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Next-generation",
          "Integrated",
          "AI-powered",
          "Cloud-native",
          "Modular",
        ])} technology platform ${faker.helpers.arrayElement([
          "for digital transformation",
          "enabling innovation ecosystems",
          "supporting collaborative research",
          "accelerating development cycles",
          "democratizing advanced tools",
        ])} ${faker.helpers.arrayElement([
          "with open architecture",
          "featuring seamless integration",
          "including developer tools",
          "offering customization options",
          "promoting community development",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Pioneering",
          "Theoretical",
          "Experimental",
          "Computational",
          "Applied",
        ])} research in ${faker.helpers.arrayElement([
          "quantum mechanics",
          "artificial intelligence",
          "biotechnology",
          "renewable energy",
          "space technology",
        ])} ${faker.helpers.arrayElement([
          "with practical applications",
          "advancing fundamental knowledge",
          "challenging conventional wisdom",
          "enabling new technologies",
          "solving complex problems",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateProcurementDescription(recordIndex: number): string {
    const templates = [
      () =>
        `${faker.helpers.arrayElement([
          "Strategic",
          "Long-term",
          "Multi-year",
          "Exclusive",
          "Partnership-based",
        ])} vendor agreement for ${faker.commerce.productName()} supply ${faker.helpers.arrayElement(
          [
            "with performance guarantees",
            "including volume discounts",
            "featuring quality assurance",
            "offering flexible terms",
            "with sustainability requirements",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Strategic",
          "Global",
          "Category-based",
          "Cost-focused",
          "Value-driven",
        ])} sourcing initiative for ${faker.helpers.arrayElement([
          "cost optimization",
          "supplier consolidation",
          "quality improvement",
          "risk mitigation",
          "innovation enhancement",
        ])} ${faker.helpers.arrayElement([
          "with measurable savings targets",
          "featuring supplier development",
          "including market analysis",
          "offering competitive advantages",
          "promoting operational excellence",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "End-to-end",
          "Integrated",
          "Cloud-based",
          "AI-powered",
          "Real-time",
        ])} supply chain management system integration ${faker.helpers.arrayElement(
          [
            "with visibility enhancement",
            "featuring predictive analytics",
            "including automation capabilities",
            "offering collaboration tools",
            "with performance dashboards",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "Performance-based",
          "Multi-vendor",
          "Framework",
          "Master",
        ])} procurement contract for ${faker.lorem.word()} services ${faker.helpers.arrayElement(
          [
            "with SLA requirements",
            "including penalty clauses",
            "featuring flexible scaling",
            "offering cost transparency",
            "with innovation incentives",
          ]
        )}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "KPI-based",
          "Real-time",
          "Automated",
          "Benchmarked",
        ])} supplier performance evaluation metrics ${faker.helpers.arrayElement(
          [
            "with scorecards",
            "featuring trend analysis",
            "including improvement plans",
            "offering feedback mechanisms",
            "with reward systems",
          ]
        )} ${faker.helpers.arrayElement([
          "for quality assurance",
          "driving continuous improvement",
          "ensuring compliance",
          "supporting decision making",
          "promoting excellence",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Automated",
          "AI-driven",
          "Real-time",
          "Cloud-based",
        ])} inventory management solution for ${faker.helpers.arrayElement([
          "warehouses",
          "distribution centers",
          "retail operations",
          "manufacturing facilities",
          "multi-location networks",
        ])} ${faker.helpers.arrayElement([
          "with demand forecasting",
          "featuring optimization algorithms",
          "including mobile access",
          "offering cost reduction",
          "with sustainability tracking",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Advanced",
          "Multi-modal",
          "Route-optimized",
          "Cost-effective",
          "Sustainable",
        ])} logistics optimization for ${faker.helpers.arrayElement([
          "global distribution",
          "regional delivery",
          "last-mile operations",
          "cross-border shipping",
          "e-commerce fulfillment",
        ])} ${faker.helpers.arrayElement([
          "with tracking capabilities",
          "featuring carbon footprint reduction",
          "including delivery time optimization",
          "offering cost transparency",
          "with customer satisfaction focus",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Strategic",
          "Competitive",
          "Win-win",
          "Value-based",
          "Long-term",
        ])} contract negotiation for ${faker.helpers.arrayElement([
          "bulk purchasing",
          "volume commitments",
          "preferred pricing",
          "exclusive arrangements",
          "partnership agreements",
        ])} ${faker.helpers.arrayElement([
          "with risk sharing mechanisms",
          "featuring performance incentives",
          "including flexibility clauses",
          "offering mutual benefits",
          "with relationship building focus",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Streamlined",
          "Digital",
          "Compliance-focused",
          "Risk-based",
          "Efficient",
        ])} vendor onboarding and compliance process ${faker.helpers.arrayElement(
          [
            "with automated workflows",
            "featuring document management",
            "including background checks",
            "offering self-service portals",
            "with approval tracking",
          ]
        )} ${faker.helpers.arrayElement([
          "ensuring regulatory compliance",
          "reducing onboarding time",
          "improving supplier quality",
          "enhancing security",
          "supporting business continuity",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "Proactive",
          "Multi-tier",
          "Scenario-based",
          "Continuous",
        ])} supply risk assessment and mitigation plan ${faker.helpers.arrayElement(
          [
            "with early warning systems",
            "featuring contingency strategies",
            "including supplier diversification",
            "offering business continuity",
            "with regular monitoring",
          ]
        )} ${faker.helpers.arrayElement([
          "protecting against disruptions",
          "ensuring supply security",
          "maintaining operational resilience",
          "supporting strategic objectives",
          "enabling competitive advantage",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }

  private generateGenericDescription(recordIndex: number): string {
    const templates = [
      () => faker.lorem.sentence({ min: 4, max: 8 }),
      () =>
        `${faker.company.catchPhrase()} ${faker.helpers.arrayElement([
          "solution",
          "platform",
          "service",
          "system",
          "framework",
        ])}`,
      () =>
        `${faker.hacker.phrase()} ${faker.helpers.arrayElement([
          "with advanced features",
          "featuring cutting-edge technology",
          "including innovative capabilities",
          "offering superior performance",
          "providing comprehensive functionality",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Premium",
          "Professional",
          "Advanced",
          "Innovative",
          "High-quality",
        ])} ${faker.color.human()} ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${faker.helpers.arrayElement(
          ["product", "solution", "component", "system", "device"]
        )}`,
      () =>
        `${faker.commerce.productDescription()} ${faker.helpers.arrayElement([
          "with enhanced durability",
          "featuring modern design",
          "including warranty coverage",
          "offering exceptional value",
          "providing reliable performance",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Comprehensive",
          "Integrated",
          "Scalable",
          "Flexible",
          "User-friendly",
        ])} ${faker.helpers.arrayElement([
          "solution",
          "platform",
          "system",
          "service",
          "application",
        ])} for ${faker.helpers.arrayElement([
          "business optimization",
          "operational efficiency",
          "productivity enhancement",
          "cost reduction",
          "performance improvement",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "State-of-the-art",
          "Next-generation",
          "Industry-leading",
          "Award-winning",
          "Best-in-class",
        ])} ${faker.helpers.arrayElement([
          "technology",
          "innovation",
          "methodology",
          "approach",
          "framework",
        ])} ${faker.helpers.arrayElement([
          "delivering exceptional results",
          "exceeding expectations",
          "setting new standards",
          "driving transformation",
          "enabling success",
        ])}`,
      () =>
        `${faker.helpers.arrayElement([
          "Custom",
          "Tailored",
          "Personalized",
          "Bespoke",
          "Made-to-order",
        ])} ${faker.helpers.arrayElement([
          "solution",
          "service",
          "product",
          "system",
          "experience",
        ])} ${faker.helpers.arrayElement([
          "designed for specific needs",
          "meeting unique requirements",
          "addressing particular challenges",
          "supporting individual goals",
          "delivering targeted outcomes",
        ])}`,
    ];

    const selectedTemplate = templates[recordIndex % templates.length];
    return selectedTemplate();
  }
}
