// ============================================================================
// INVALID INPUTS - Cenários de Validação (400)
// ============================================================================

// --- Missing Required Fields ---

export const INVOICE_MISSING_MONTH_INPUT = {
  year: 2026,
  type: "cash",
};

export const INVOICE_MISSING_YEAR_INPUT = {
  month: 6,
  type: "cash",
};

export const INVOICE_MISSING_TYPE_INPUT = {
  month: 6,
  year: 2026,
};

export const INVOICE_EMPTY_PAYLOAD = {};

// --- Invalid Strategy Type ---

export const INVOICE_INVALID_TYPE_INPUT = {
  month: 6,
  year: 2026,
  type: "invalid",
};

export const INVOICE_UPPERCASE_TYPE_INPUT = {
  month: 6,
  year: 2026,
  type: "CASH",
};

// --- Wrong Data Types ---

export const INVOICE_MONTH_AS_STRING_INPUT = {
  month: "6",
  year: 2026,
  type: "cash",
};

export const INVOICE_YEAR_AS_STRING_INPUT = {
  month: 6,
  year: "2026",
  type: "cash",
};

export const INVOICE_TYPE_AS_NUMBER_INPUT = {
  month: 6,
  year: 2026,
  type: 123,
};

// --- Null Values ---

export const INVOICE_NULL_MONTH_INPUT = {
  month: null,
  year: 2026,
  type: "cash",
};

export const INVOICE_NULL_YEAR_INPUT = {
  month: 6,
  year: null,
  type: "cash",
};

export const INVOICE_NULL_TYPE_INPUT = {
  month: 6,
  year: 2026,
  type: null,
};
