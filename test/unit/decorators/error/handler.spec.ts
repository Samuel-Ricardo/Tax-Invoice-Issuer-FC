import { ErrorHandler } from "../../../../src/@decorators/error/handler.decorator";
import { AppError } from "../../../../src/@lib/error/app.error";

describe("[ERROR] - [HANDLER DECORATOR]", () => {
  // ============================================================================
  // HAPPY PATH
  // ============================================================================

  it("[UNIT] | [DECORATOR] - ErrorHandler > passes through successful result", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork(): Promise<string> {
        return "success";
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork();

    expect(result).toBe("success");
  });

  it("[UNIT] | [DECORATOR] - ErrorHandler > passes through resolved value of any type", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork() {
        return { data: [1, 2, 3], count: 3 };
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork();

    expect(result).toEqual({ data: [1, 2, 3], count: 3 });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  it("[UNIT] | [DECORATOR] - ErrorHandler > catches AppError and returns struct", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork() {
        throw new AppError("Custom error", 422, { field: "month" });
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork();

    expect(result).toEqual({
      error: true,
      message: "Custom error",
      status: 422,
      data: { field: "month" },
    });
  });

  it("[UNIT] | [DECORATOR] - ErrorHandler > catches generic Error and wraps in AppError struct", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork() {
        throw new Error("Something went wrong");
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork();

    expect(result).toHaveProperty("error", true);
    expect(result).toHaveProperty("message", "Something went wrong");
    expect(result).toHaveProperty("status", 500);
  });

  it("[UNIT] | [DECORATOR] - ErrorHandler > returns AppError default status 500 for wrapped errors", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork() {
        throw new Error("Unexpected failure");
      }
    }

    const instance = new TestClass();
    const result = (await instance.doWork()) as any;

    expect(result.status).toBe(500);
    expect(result.error).toBe(true);
  });

  it("[UNIT] | [DECORATOR] - ErrorHandler > preserves AppError status code", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork() {
        throw new AppError("Not found", 404);
      }
    }

    const instance = new TestClass();
    const result = (await instance.doWork()) as any;

    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
  });

  // ============================================================================
  // DECORATOR PRESERVATION
  // ============================================================================

  it("[UNIT] | [DECORATOR] - ErrorHandler > preserves method arguments", async () => {
    class TestClass {
      @ErrorHandler()
      async doWork(a: number, b: number): Promise<number> {
        return a + b;
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork(3, 5);

    expect(result).toBe(8);
  });
});
