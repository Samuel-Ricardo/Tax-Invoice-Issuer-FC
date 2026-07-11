import "reflect-metadata";
import { Validate } from "../../../../src/@decorators/validation/validation.decorator";
import { Specification } from "../../../../src/@modules/domain/specification/specification.interface";

// ============================================================================
// MOCK SPECIFICATION
// ============================================================================

const createPassingSpec = (): Specification<any> => ({
  isSatisfiedBy: jest.fn().mockReturnValue(true),
  and: jest.fn(),
  or: jest.fn(),
  not: jest.fn(),
});

const createFailingSpec = (): Specification<any> => ({
  isSatisfiedBy: jest.fn().mockReturnValue(false),
  and: jest.fn(),
  or: jest.fn(),
  not: jest.fn(),
});

const createThrowingSpec = (message = "Invalid input"): Specification<any> => ({
  isSatisfiedBy: jest.fn().mockImplementation(() => {
    throw new Error(message);
  }),
  and: jest.fn(),
  or: jest.fn(),
  not: jest.fn(),
});

describe("[VALIDATION] - [VALIDATE DECORATOR]", () => {
  // ============================================================================
  // SPECIFICATION OBJECT INJECTION
  // ============================================================================

  it("[UNIT] | [VALIDATE] - passes through when specification is satisfied (spec object)", async () => {
    const spec = createPassingSpec();

    class TestClass {
      @Validate(spec)
      async doWork(_params: any, _body: any, _headers: any) {
        return "result";
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork({}, { month: 1 }, {});

    expect(result).toBe("result");
    expect(spec.isSatisfiedBy).toHaveBeenCalledWith({ month: 1 });
  });

  it("[UNIT] | [VALIDATE] - proceeds even when specification returns false (logs and continues)", async () => {
    const spec = createFailingSpec();

    class TestClass {
      @Validate(spec)
      async doWork(_params: any, _body: any, _headers: any) {
        return "executed";
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork({}, { invalid: true }, {});

    // Validate decorator only logs when false, still calls original method
    expect(result).toBe("executed");
  });

  it("[UNIT] | [VALIDATE] - throws when specification throws", async () => {
    const spec = createThrowingSpec("Validation failed");

    class TestClass {
      @Validate(spec)
      async doWork(_params: any, _body: any, _headers: any) {
        return "should not reach";
      }
    }

    const instance = new TestClass();

    await expect(instance.doWork({}, { bad: "data" }, {})).rejects.toThrow(
      "Validation failed",
    );
  });

  // ============================================================================
  // STRING KEY INJECTION (runtime resolution from `this`)
  // ============================================================================

  it("[UNIT] | [VALIDATE] - resolves specification from this[key] at runtime", async () => {
    const spec = createPassingSpec();

    class TestClass {
      specification: Specification<any> = spec;

      @Validate("specification")
      async doWork(_params: any, _body: any, _headers: any) {
        return "ok";
      }
    }

    const instance = new TestClass();
    const result = await instance.doWork({}, { data: "test" }, {});

    expect(result).toBe("ok");
    expect(spec.isSatisfiedBy).toHaveBeenCalledWith({ data: "test" });
  });

  it("[UNIT] | [VALIDATE] - throws when spec resolved from string key throws", async () => {
    const spec = createThrowingSpec("Key-based error");

    class TestClass {
      specification: Specification<any> = spec;

      @Validate("specification")
      async doWork(_params: any, _body: any, _headers: any) {
        return "unreachable";
      }
    }

    const instance = new TestClass();

    await expect(instance.doWork({}, {}, {})).rejects.toThrow(
      "Key-based error",
    );
  });

  // ============================================================================
  // ARGUMENT PASSTHROUGH
  // ============================================================================

  it("[UNIT] | [VALIDATE] - passes all arguments to original method", async () => {
    const spec = createPassingSpec();
    const receivedArgs: any[] = [];

    class TestClass {
      @Validate(spec)
      async doWork(params: any, body: any, headers: any) {
        receivedArgs.push(params, body, headers);
        return "done";
      }
    }

    const instance = new TestClass();
    await instance.doWork(
      { id: "1" },
      { month: 6 },
      { "content-type": "json" },
    );

    expect(receivedArgs[0]).toEqual({ id: "1" });
    expect(receivedArgs[1]).toEqual({ month: 6 });
    expect(receivedArgs[2]).toEqual({ "content-type": "json" });
  });
});
