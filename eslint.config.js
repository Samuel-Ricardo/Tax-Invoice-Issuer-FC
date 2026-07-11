const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "jest.config.js",
      ".env",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  {
    files: [".eslintrc.{js,cjs}"],
    languageOptions: {
      parserOptions: {
        sourceType: "script",
      },
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
);
