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
  ],
};

