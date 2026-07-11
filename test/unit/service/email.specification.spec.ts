import "reflect-metadata";
import { TEST_MODULES } from "../../module/app.factory";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";

describe("[SPECIFICATION] - [ZOD] - [EMAIL]", () => {
  // ============================================================================
  // isSatisfiedBy
  // ============================================================================

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns true for valid Invoice", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const validInvoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      error: undefined,
      value: validInvoice,
    });

    expect(module.specificaiton.isSatisfiedBy(validInvoice)).toBe(true);
  });

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns false for invalid Invoice (validation fails)", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invalidInvoice = new Invoice(null as any, -1);

    (module.validator.validate as jest.Mock).mockImplementation(() => {
      throw new Error("Validation error");
    });

    expect(() => module.specificaiton.isSatisfiedBy(invalidInvoice)).toThrow();
  });

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns false when isValid is false", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date(), 0);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      error: undefined,
      value: null,
    });

    expect(module.specificaiton.isSatisfiedBy(invoice)).toBe(false);
  });

  // ============================================================================
  // and
  // ============================================================================

  it("[UNIT] | [SPEC] - and > returns true when both specifications are satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      error: undefined,
      value: invoice,
    });

    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(true),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };

    expect(module.specificaiton.and(other, invoice)).toBe(true);
    expect(other.isSatisfiedBy).toHaveBeenCalledWith(invoice);
  });

  it("[UNIT] | [SPEC] - and > returns false when this spec is not satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      error: undefined,
      value: null,
    });

    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(true),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };

    expect(module.specificaiton.and(other, invoice)).toBe(false);
  });

  // ============================================================================
  // or
  // ============================================================================

  it("[UNIT] | [SPEC] - or > returns true when at least one specification is satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      error: undefined,
      value: invoice,
    });

    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(false),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };

    expect(module.specificaiton.or(other, invoice)).toBe(true);
  });

  it("[UNIT] | [SPEC] - or > returns false when neither specification is satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      error: undefined,
      value: null,
    });

    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(false),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };

    expect(module.specificaiton.or(other, invoice)).toBe(false);
  });

  // ============================================================================
  // not
  // ============================================================================

  it("[UNIT] | [SPEC] - not > returns false when specification is satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      error: undefined,
      value: invoice,
    });

    expect(module.specificaiton.not(invoice)).toBe(false);
  });

  it("[UNIT] | [SPEC] - not > returns true when specification is not satisfied", () => {
    const module = TEST_MODULES.APPLICATION.SPECIFICATION.ZOD.EMAIL.SIMULATE();
    const invoice = new Invoice(new Date("2022-01-15"), 1000);

    (module.validator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      error: undefined,
      value: null,
    });

    expect(module.specificaiton.not(invoice)).toBe(true);
  });
});
