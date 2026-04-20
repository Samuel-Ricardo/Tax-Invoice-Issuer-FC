import { inject, injectable } from "inversify";
import { MODULE } from "../../../app.registry";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { Specification } from "../../../domain/specification/specification.interface";
import { Validator } from "../../../domain/validator/validator.interface";
import { ZodValidator } from "../../../infra/validator/zod/zod.validator";
import { date } from "zod";

@injectable()
export class EmailSpecificationZod implements Specification<Invoice> {
  constructor(
    @inject(MODULE.INFRA.VALIDATOR.ZOD)
    private readonly validator: ZodValidator<Invoice>,
  ) {
    this.setupRules();
  }

  isSatisfiedBy(cadidate: Invoice): boolean {
    return this.validator.validate(cadidate).isValid;
  }

  and(other: Specification<Invoice>, cadidate: Invoice): boolean {
    throw new Error("Method not implemented.");
  }

  or(other: Specification<Invoice>, cadidate: Invoice): boolean {
    throw new Error("Method not implemented.");
  }

  not(cadidate: Invoice): boolean {
    throw new Error("Method not implemented.");
  }

  private setupRules() {
    this.validator.setRules(
      this.validator.engine.object({
        date: this.validator.engine.date(),
        amount: this.validator.engine.number(),
      }),
    );
  }
}
