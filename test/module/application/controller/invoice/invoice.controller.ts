import { mockDeep } from "jest-mock-extended";
import { InvoiceController } from "../../../../../src/@modules/application/controller/invoice/invoice.controller";

export const mockInvoiceController = mockDeep<InvoiceController>();

export const simulateInvoiceController = (module: ResolutionContext) => {
  const controller = new InvoiceController();
  return { controller };
};
