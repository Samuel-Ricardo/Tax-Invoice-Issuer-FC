import "reflect-metadata";
import { z } from "zod";
import { ZodValidator } from "../../../src/@modules/infra/validator/zod/zod.validator";
import { InvalidDataError } from "../../../src/@lib/error/validation/data.error";

describe("[ZOD] - [VALIDATOR]", () => {
  let validator: ZodValidator<any>;

  const invoiceSchema = z.object({
    month: z.number(),
    year: z.number(),
    type: z.enum(["cash", "accrual"]),
  });

  beforeEach(() => {
    validator = new ZodValidator(z);
    validator.setRules(invoiceSchema);
  });

  // ============================================================================
  // setRules
  // ============================================================================

  it("[UNIT] | [VALIDATOR] - setRules > configures schema for validation", () => {
    const newValidator = new ZodValidator(z);
    newValidator.setRules(z.object({ name: z.string() }));

    const result = newValidator.validate({ name: "test" });

    expect(result.isValid).toBe(true);
  });

  // ============================================================================
  // validate (sync)
  // ============================================================================

  it("[UNIT] | [VALIDATOR] - validate > returns valid result for correct input", () => {
    const result = validator.validate({ month: 1, year: 2026, type: "cash" });

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("[UNIT] | [VALIDATOR] - validate > throws InvalidDataError for missing required field", () => {
    expect(() => validator.validate({ year: 2026, type: "cash" })).toThrow(
      InvalidDataError,
    );
  });

  it("[UNIT] | [VALIDATOR] - validate > throws for invalid type enum value", () => {
    expect(() =>
      validator.validate({ month: 1, year: 2026, type: "invalid" }),
    ).toThrow(InvalidDataError);
  });

  it("[UNIT] | [VALIDATOR] - validate > accepts schema override parameter", () => {
    const overrideSchema = z.object({ name: z.string() });

    const result = validator.validate(
      { name: "override" },
      overrideSchema as any,
    );

    expect(result.isValid).toBe(true);
  });

  it("[UNIT] | [VALIDATOR] - validate > uses override schema instead of set rules", () => {
    const overrideSchema = z.object({ code: z.number() });

    // Standard schema would fail for this input, but override schema accepts it
    const result = validator.validate({ code: 42 }, overrideSchema as any);

    expect(result.isValid).toBe(true);
  });

  // ============================================================================
  // validateAsync (async)
  // ============================================================================

  it("[UNIT] | [VALIDATOR] - validateAsync > resolves with valid result for correct input", async () => {
    const result = await validator.validateAsync({
      month: 6,
      year: 2026,
      type: "accrual",
    });

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("[UNIT] | [VALIDATOR] - validateAsync > rejects with InvalidDataError for invalid input", async () => {
    await expect(
      validator.validateAsync({
        month: "not-a-number",
        year: 2026,
        type: "cash",
      }),
    ).rejects.toThrow(InvalidDataError);
  });

  it("[UNIT] | [VALIDATOR] - validateAsync > rejects for missing field", async () => {
    await expect(
      validator.validateAsync({ month: 1, year: 2026 }),
    ).rejects.toThrow(InvalidDataError);
  });

  it("[UNIT] | [VALIDATOR] - validateAsync > accepts schema override parameter", async () => {
    const overrideSchema = z.object({ email: z.string().email() });

    const result = await validator.validateAsync(
      { email: "test@example.com" },
      overrideSchema as any,
    );

    expect(result.isValid).toBe(true);
  });

  it("[UNIT] | [VALIDATOR] - validateAsync > returns value in result when valid", async () => {
    const input = { month: 3, year: 2026, type: "cash" as const };

    const result = await validator.validateAsync(input);

    expect(result.value).toMatchObject(input);
  });

  // ============================================================================
  // engine property
  // ============================================================================

  it("[UNIT] | [VALIDATOR] - engine > exposes the ZOD engine instance", () => {
    expect(validator.engine).toBe(z);
  });

  // ============================================================================
  // handleError - private, edge case branch coverage
  // ============================================================================

  it("[UNIT] | [VALIDATOR] - handleError > throws InvalidDataError without details when result.error is falsy", () => {
    // Covers the branch: throw !result.error ? new InvalidDataError() : ...
    // This edge case is when validation fails but Zod doesn't provide an error object
    const mockResult = { success: false as const, error: undefined };

    expect(() => (validator as any).handleError(mockResult)).toThrow(
      InvalidDataError,
    );
  });
});
