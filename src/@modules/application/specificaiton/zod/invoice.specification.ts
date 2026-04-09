import { Invoice } from "../../../domain/entity/invoice.entity";
import { Specification } from "../../../domain/specification/specification.interface";
import { ZodValidator } from "../../../infra/validator/zod/zod.validator";

export class InvoiceSpecificationZod implements Specification<Invoice> {
  constructor(private readonly validator: ZodValidator<Invoice>) {
    this.setupRules();
  }

  isSatisfiedBy(cadidate: Invoice): boolean {}

  and(other: Specification<Invoice>): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }
  or(other: Specification<Invoice>): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }
  not(): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }
}
