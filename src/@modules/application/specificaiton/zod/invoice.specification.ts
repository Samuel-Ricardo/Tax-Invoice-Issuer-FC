import { Invoice } from "../../../domain/entity/invoice.entity";
import { Specification } from "../../../domain/specification/specification.interface";
import { ZodValidator } from "../../../infra/validator/zod/zod.validator";

export class InvoiceSpecificationZod implements Specification<Invoice> {
  constructor(private readonly validator: ZodValidator<Invoice>) {
    this.setupRules();
  }

  isSatisfiedBy(cadidate: Invoice): boolean {
    return this.validator.validate(cadidate).isValid;
  }

  and(other: Specification<Invoice>): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }
  or(other: Specification<Invoice>): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }
  not(): Specification<Invoice> {
    throw new Error("Method not implemented.");
  }

  private setupRules(): void {
    this.validator.setRules(
      this.validator.engine.object({
        date: this.validator.engine.date(),
        amount: this.validator.engine.number(),
      }),
    );
  }
}
