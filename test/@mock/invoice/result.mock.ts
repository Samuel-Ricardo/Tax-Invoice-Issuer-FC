import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";

// ============================================================================
// INVOICE RESULTS - Dados de retorno para mocks de service
// ============================================================================

export const INVOICE_RESULT_LIST = [
  new Invoice(new Date("2026-06-01"), 5000),
  new Invoice(new Date("2026-06-15"), 3000),
];

export const INVOICE_RESULT_SINGLE = [
  new Invoice(new Date("2026-06-01"), 5000),
];

export const INVOICE_RESULT_EMPTY: Invoice[] = [];

export const INVOICE_RESULT_PRESENTED = JSON.stringify(INVOICE_RESULT_LIST);
