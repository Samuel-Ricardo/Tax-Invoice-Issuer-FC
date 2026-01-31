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

  //MY-II
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

