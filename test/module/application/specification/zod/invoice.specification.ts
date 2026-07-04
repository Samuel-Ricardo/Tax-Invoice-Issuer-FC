import { mockDeep } from "jest-mock-extended";
import { InvoiceSpecificationZod } from "../../../../../src/@modules/application/specificaiton/zod/invoice.specification";
import { TEST_MODULE } from "../../../app.registry";
import { ResolutionContext } from "inversify";
import { ZodValidator } from "../../../../../src/@modules/infra/validator/zod/zod.validator";
import { InvoiceDTO } from "../../../../../src/@modules/domain/DTO/invoice.dto";
import { SimulatedInvoiceSpecification } from "../../../../@types/specification/invoice/simulated.type";

export const mockZodInvoiceSpeficiation = mockDeep<InvoiceSpecificationZod>();

export const simulateInvoiceSpecificationZod = (
  module: ResolutionContext,
): SimulatedInvoiceSpecification => {
  const validator = module.get<ZodValidator<InvoiceDTO>>(
    TEST_MODULE.INFRA.VALIDATION.ZOD.MOCK,
  );

  const specificaiton = new InvoiceSpecificationZod(validator);

  return {
    specificaiton,
    validator,
  };
};
