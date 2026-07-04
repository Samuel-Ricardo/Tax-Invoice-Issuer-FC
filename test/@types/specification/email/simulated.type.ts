import { EmailSpecificationZod } from "../../../../src/@modules/application/specificaiton/zod/email.specification";
import { ZodValidator } from "../../../../src/@modules/infra/validator/zod/zod.validator";
import { Invoice } from "../../../../src/@modules/domain/entity/invoice.entity";

export interface SimulatedEmailSpecification {
  specificaiton: EmailSpecificationZod;
  validator: ZodValidator<Invoice>;
}
