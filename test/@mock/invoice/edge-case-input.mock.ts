// ============================================================================
// EDGE CASE INPUTS - Boundaries and Extreme Values (200 - accepted without range validation)
// ============================================================================

// --- Month Boundaries ---

export const INVOICE_MONTH_BOUNDARY_MIN_INPUT = {
  month: 1,
  year: 2026,
  type: "cash",
};

export const INVOICE_MONTH_BOUNDARY_MAX_INPUT = {
  month: 12,
  year: 2026,
  type: "cash",
};

// --- Out-of-Range Months ---

export const INVOICE_MONTH_ZERO_INPUT = {
  month: 0,
  year: 2026,
  type: "cash",
};

export const INVOICE_MONTH_THIRTEEN_INPUT = {
  month: 13,
  year: 2026,
  type: "cash",
};

export const INVOICE_MONTH_NEGATIVE_INPUT = {
  month: -1,
  year: 2026,
  type: "cash",
};

// --- Year Boundaries ---

export const INVOICE_YEAR_START_OF_DATA_INPUT = {
  month: 1,
  year: 2022,
  type: "cash",
};

export const INVOICE_YEAR_FAR_FUTURE_INPUT = {
  month: 6,
  year: 2099,
  type: "cash",
};

export const INVOICE_YEAR_NEGATIVE_INPUT = {
  month: 6,
  year: -2026,
  type: "cash",
};

export const INVOICE_YEAR_TOO_LARGE_INPUT = {
  month: 6,
  year: 99999,
  type: "cash",
};

// --- Float Values ---

export const INVOICE_MONTH_FLOAT_INPUT = {
  month: 6.5,
  year: 2026,
  type: "cash",
};

export const INVOICE_YEAR_FLOAT_INPUT = {
  month: 6,
  year: 2026.5,
  type: "cash",
};
