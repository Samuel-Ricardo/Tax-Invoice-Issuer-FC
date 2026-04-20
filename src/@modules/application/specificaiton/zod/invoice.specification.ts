import { inject } from "inversify";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { Specification } from "../../../domain/specification/specification.interface";
import { ZodValidator } from "../../../infra/validator/zod/zod.validator";
import { MODULE } from "../../../app.registry";
import { InvoiceDTO } from "../../../domain/DTO/invoice.dto";

export class InvoiceSpecificationZod implements Specification<InvoiceDTO> {
  constructor(
    @inject(MODULE.INFRA.VALIDATOR.ZOD)
    private readonly validator: ZodValidator<InvoiceDTO>,
  ) {
    this.setupRules();
  }

  isSatisfiedBy(cadidate: InvoiceDTO): boolean {
    return this.validator.validate(cadidate).isValid;
  }

  and(other: Specification<InvoiceDTO>, cadidate: InvoiceDTO): boolean {
    return this.isSatisfiedBy(cadidate) && other.isSatisfiedBy(cadidate);
  }
  or(other: Specification<InvoiceDTO>, cadidate: InvoiceDTO): boolean {
    return this.isSatisfiedBy(cadidate) || other.isSatisfiedBy(cadidate);
  }
  not(cadidate: InvoiceDTO): boolean {
    return !this.isSatisfiedBy(cadidate);
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
