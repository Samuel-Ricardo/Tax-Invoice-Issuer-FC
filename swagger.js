const swaggerAutogen = require("swagger-autogen")();
//require('dotenv').config()

const doc = {
  info: {
    title: "Tax-Invoice-Issuer-FC",
    description:
      "Tax Invoice Issuer to Study Design Patterns in Full Cycle MBA",
  },
  host: process.env.HOST || "localhost:3000",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

const outputFile = "./docs/swagger.json";
const routes = ["./src/server.ts"];

swaggerAutogen(outputFile, routes, doc);
