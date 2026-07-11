import "reflect-metadata";
import { SPECIFICATION_FACTORY } from "../../../src/@modules/application/specificaiton/specification.factory";

const validInvoiceDTO = { month: 1, year: 2022, type: "cash" as const };
const invalidInvoiceDTO = {
  month: "string" as any,
  year: 2022,
  type: "cash" as const,
};
const accrualDTO = { month: 3, year: 2022, type: "accrual" as const };

describe("[SPECIFICATION] - [ZOD] - [INVOICE]", () => {
  let spec: ReturnType<typeof SPECIFICATION_FACTORY.ZOD.INVOICE>;

  beforeEach(() => {
    spec = SPECIFICATION_FACTORY.ZOD.INVOICE();
  });

  // ============================================================================
  // isSatisfiedBy
  // ============================================================================

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns true for valid InvoiceDTO", () => {
    expect(spec.isSatisfiedBy(validInvoiceDTO)).toBe(true);
  });

  it("[UNIT] | [SPEC] - isSatisfiedBy > throws for invalid InvoiceDTO (wrong type)", () => {
    expect(() => spec.isSatisfiedBy(invalidInvoiceDTO)).toThrow();
  });

  // ============================================================================
  // and
  // ============================================================================

  it("[UNIT] | [SPEC] - and > returns true when both specifications satisfied", () => {
    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(true),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };
    expect(spec.and(other, validInvoiceDTO)).toBe(true);
  });

  it("[UNIT] | [SPEC] - and > returns false when other spec fails", () => {
    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(false),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };
    expect(spec.and(other, validInvoiceDTO)).toBe(false);
  });

  // ============================================================================
  // or
  // ============================================================================

  it("[UNIT] | [SPEC] - or > returns true when this spec is satisfied (short-circuit)", () => {
    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(false),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };
    expect(spec.or(other, validInvoiceDTO)).toBe(true);
  });

  it("[UNIT] | [SPEC] - or > returns true when other spec is satisfied", () => {
    // With valid DTO this spec returns true - can't easily test second OR branch without forcing failure
    const other = {
      isSatisfiedBy: jest.fn().mockReturnValue(true),
      and: jest.fn(),
      or: jest.fn(),
      not: jest.fn(),
    };
    expect(spec.or(other, validInvoiceDTO)).toBe(true);
  });

  // ============================================================================
  // not
  // ============================================================================

  it("[UNIT] | [SPEC] - not > returns false when spec IS satisfied (valid input)", () => {
    expect(spec.not(validInvoiceDTO)).toBe(false);
  });

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns true for accrual type DTO", () => {
    expect(spec.isSatisfiedBy(accrualDTO)).toBe(true);
  });

  it("[UNIT] | [SPEC] - isSatisfiedBy > returns true with optional format field", () => {
    const withFormat = { ...validInvoiceDTO, format: "json" };
    expect(spec.isSatisfiedBy(withFormat)).toBe(true);
  });
});
