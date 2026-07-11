import "reflect-metadata";
import { HTTP_SERVER_ENGINE_FACTORY } from "../../../../../../src/@modules/infra/engine/server/http/http.factory";

/**
 * TEST: http.factory > HTTP_SERVER_ENGINE_FACTORY accessors
 *
 * Gap: Functions coverage 33.33% on http.factory.ts
 * The factory exports accessor functions that need to be invoked to count as "functions exercised"
 */
describe("[INFRA] - [ENGINE] - [SERVER] - [HTTP] > http.factory accessors", () => {
  it("[UNIT] | http.factory > EXPRESS accessor returns object with functions", () => {
    // Act
    const expressFactory = HTTP_SERVER_ENGINE_FACTORY.EXPRESS;

    // Assert: Factory returns an object with express-related accessors
    expect(expressFactory).toBeDefined();
    expect(typeof expressFactory).toBe("object");
    expect(typeof expressFactory._).toBe("function");
    expect(typeof expressFactory.CORS).toBe("function");
    expect(typeof expressFactory.PARSER).toBe("object");
  });

  it("[UNIT] | http.factory > EXPRESS._ accessor returns express instance", () => {
    // Act
    const expressApp = HTTP_SERVER_ENGINE_FACTORY.EXPRESS._();

    // Assert: Should return an express app instance
    expect(expressApp).toBeDefined();
    expect(typeof expressApp).toBe("function"); // express apps are functions
  });

  it("[UNIT] | http.factory > EXPRESS.CORS accessor returns cors middleware", () => {
    // Act
    const corsMiddleware = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.CORS();

    // Assert: Should return cors middleware
    expect(corsMiddleware).toBeDefined();
    expect(typeof corsMiddleware).toBe("function");
  });

  it("[UNIT] | http.factory > EXPRESS.PARSER.JSON accessor returns json parser", () => {
    // Act
    const jsonParser = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.PARSER.JSON();

    // Assert: Should return json parser middleware
    expect(jsonParser).toBeDefined();
    expect(typeof jsonParser).toBe("function");
  });

  it("[UNIT] | http.factory > calling each accessor multiple times returns valid instances", () => {
    // Act - Call each accessor twice
    const app1 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS._();
    const app2 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS._();
    const cors1 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.CORS();
    const cors2 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.CORS();
    const json1 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.PARSER.JSON();
    const json2 = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.PARSER.JSON();

    // Assert: Each call should return something
    expect(app1).toBeDefined();
    expect(app2).toBeDefined();
    expect(cors1).toBeDefined();
    expect(cors2).toBeDefined();
    expect(json1).toBeDefined();
    expect(json2).toBeDefined();

    // All should be functions (express middleware pattern)
    expect(typeof app1).toBe("function");
    expect(typeof cors1).toBe("function");
    expect(typeof json1).toBe("function");
  });

  it("[UNIT] | http.factory > EXPRESS.PARSER has nested structure", () => {
    // Act
    const parser = HTTP_SERVER_ENGINE_FACTORY.EXPRESS.PARSER;

    // Assert: Parser should have JSON accessor
    expect(parser).toBeDefined();
    expect(typeof parser.JSON).toBe("function");
  });
});
