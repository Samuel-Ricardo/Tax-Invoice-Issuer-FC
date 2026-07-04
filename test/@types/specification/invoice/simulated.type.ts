import { InvoiceSpecificationZod } from "../../../../src/@modules/application/specificaiton/zod/invoice.specification";
import { ZodValidator } from "../../../../src/@modules/infra/validator/zod/zod.validator";
import { InvoiceDTO } from "../../../../src/@modules/domain/DTO/invoice.dto";

export interface SimulatedInvoiceSpecification {
  specificaiton: InvoiceSpecificationZod;
  validator: ZodValidator<InvoiceDTO>;
}
