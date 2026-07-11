const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },

  //MY-I
  preset: "ts-jest",

  // Setup - carrega env vars antes dos testes
  setupFiles: ["./test/setup-env.ts"],

  //MY-II
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  
  testTimeout: 10000,
  
  // Test configuration
  testMatch: [
    "**/test-ai/**/*.spec.ts",
    "**/test/**/*.spec.ts",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
    "/coverage/",
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    // TypeScript interface/type files compile to nothing - exclude from coverage
    "!src/**/*.interface.ts",
    "!src/**/*.type.ts",
    "!src/@types/**",
    // DTOs are just TypeScript type declarations - no executable code
    "!src/**/*.dto.ts",
    // Entry point - not testable in unit/integration context
    "!src/server.ts",
    // Domain layer interfaces (TypeScript only, compile to nothing)
    "!src/@modules/domain/repository/**",
    "!src/@modules/domain/service/**",
    "!src/@modules/domain/use-case/**",
    // Domain DTO files (TypeScript type declarations)
    "!src/@modules/domain/DTO/**",
    // Infrastructure interfaces that compile to nothing
    "!src/@modules/infra/server/http/http.server.ts",
    "!src/@modules/infra/engine/database/connection/sql/sql.connection.ts",
  ],
};

