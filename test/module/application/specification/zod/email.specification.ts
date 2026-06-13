import { mockDeep } from "jest-mock-extended";
import { EmailSpecificationZod } from "../../../../../src/@modules/application/specificaiton/zod/email.specification";
import { ResolutionContext } from "inversify";
import { ZodValidator } from "../../../../../src/@modules/infra/validator/zod/zod.validator";
import { Invoice } from "../../../../../src/@modules/domain/entity/invoice.entity";
import { TEST_MODULE } from "../../../app.registry";

export const mockZodEmailSpeficiation = mockDeep<EmailSpecificationZod>();

export const simulateEmailSpecificationZod = (module: ResolutionContext) => {
  const validator = module.get<ZodValidator<Invoice>>(
    TEST_MODULE.INFRA.VALIDATION.ZOD.MOCK,
  );

  const specificaiton = new EmailSpecificationZod(validator);

  return {
    specificaiton,
    validator,
  };
};
