import { Logger, Loggable } from "../../../../src/@decorators/logger.decorator";

@Logger()
class TestClass extends Loggable {
  testMethod() {
    return "test";
  }
}

describe("[UNIT] Decorator - Logger", () => {
  let instance: TestClass;
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    instance = new TestClass();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Logger Decorator", () => {
    test("Should add logging methods to class", () => {
      expect(instance.log).toBeDefined();
      expect(instance.info).toBeDefined();
      expect(instance.warn).toBeDefined();
      expect(instance.error).toBeDefined();
    });

    test("Should preserve original class methods", () => {
      expect(instance.testMethod).toBeDefined();
      expect(instance.testMethod()).toBe("test");
    });
  });

  describe("log", () => {
    test("Should log message with context", () => {
      instance.log({ context: "TestContext", message: "Test message" });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TestContext] | Test message",
      );
    });

    test("Should log with additional data", () => {
      instance.log(
        { context: "TestContext", message: "Test message" },
        { extra: "data" },
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TestContext] | Test message",
        { extra: "data" },
      );
    });

    test("Should log with multiple data arguments", () => {
      instance.log(
        { context: "TestContext", message: "Test" },
        "arg1",
        "arg2",
        "arg3",
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TestContext] | Test",
        "arg1",
        "arg2",
        "arg3",
      );
    });
  });

  describe("info", () => {
    test("Should log info message with context", () => {
      instance.info({ context: "InfoContext", message: "Info message" });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "[InfoContext] | Info message",
      );
    });

    test("Should log info with additional data", () => {
      instance.info({ context: "InfoContext", message: "Info" }, { data: 123 });

      expect(consoleInfoSpy).toHaveBeenCalledWith("[InfoContext] | Info", {
        data: 123,
      });
    });
  });

  describe("warn", () => {
    test("Should log warning message with context", () => {
      instance.warn({ context: "WarnContext", message: "Warning message" });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[WarnContext] | Warning message",
      );
    });

    test("Should log warning with additional data", () => {
      instance.warn(
        { context: "WarnContext", message: "Warning" },
        { warning: "data" },
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith("[WarnContext] | Warning", {
        warning: "data",
      });
    });
  });

  describe("error", () => {
    test("Should log error message with context and error object", () => {
      const error = new Error("Test error");
      instance.error({
        context: "ErrorContext",
        message: "Error occurred",
        error,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ErrorContext] | Error occurred ",
        error,
      );
    });

    test("Should log error with additional data", () => {
      const error = new Error("Test error");
      instance.error(
        {
          context: "ErrorContext",
          message: "Error",
          error,
        },
        { extra: "info" },
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ErrorContext] | Error ",
        error,
        { extra: "info" },
      );
    });

    test("Should handle error without error object", () => {
      instance.error({
        context: "ErrorContext",
        message: "Error message",
        error: undefined as any,
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("Multiple Instances", () => {
    test("Should work with multiple instances independently", () => {
      const instance1 = new TestClass();
      const instance2 = new TestClass();

      instance1.log({ context: "Instance1", message: "Message 1" });
      instance2.log({ context: "Instance2", message: "Message 2" });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });
});
