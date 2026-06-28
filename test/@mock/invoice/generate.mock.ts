// ============================================================================
// VALID INPUTS - Cenários de Sucesso
// ============================================================================

export const INVOICE_GENERATE_VALID_INPUT = {
  month: 6,
  year: 2026,
  type: "cash",
};

export const INVOICE_GENERATE_ACCRUAL_INPUT = {
  month: 1,
  year: 2022,
  type: "accrual",
};

export const INVOICE_GENERATE_WITH_FORMAT_INPUT = {
  month: 6,
  year: 2026,
  type: "cash",
  format: "json",
};

export const INVOICE_GENERATE_WITH_EXTRA_FIELDS_INPUT = {
  month: 6,
  year: 2026,
  type: "cash",
  extraField: "should-be-ignored",
  anotherExtra: 123,
};
