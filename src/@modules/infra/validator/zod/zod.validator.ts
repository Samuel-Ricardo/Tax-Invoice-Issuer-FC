import { inject, injectable } from "inversify";
import {
  ValidationResult,
  Validator,
} from "../../../domain/validator/validator.interface";
import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { MODULE } from "../../../app.registry";

@injectable()
export class ZodValidator implements Validator<any> {
  constructor(
    @inject(MODULE.INFRA.ENGINE.VALIDATION.ZOD)
    private readonly engine: ZOD,
  ) {}

  validate(value: any): ValidationResult {
    throw new Error("Method not implemented.");
  }
  validateAsync(value: any): Promise<ValidationResult> {
    throw new Error("Method not implemented.");
  }
  parse(value: any) {
    throw new Error("Method not implemented.");
  }
  setSchema(schema: any): void {
    throw new Error("Method not implemented.");
  }
}
