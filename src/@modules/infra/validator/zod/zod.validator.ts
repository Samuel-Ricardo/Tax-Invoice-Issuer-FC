import { inject, injectable } from "inversify";
import {
  ValidationError,
  ValidationResult,
  Validator,
} from "../../../domain/validator/validator.interface";
import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { MODULE } from "../../../app.registry";
import { ZodError, ZodIssue, ZodObject } from "zod";

@injectable()
export class ZodValidator implements Validator<any> {
  private schema: ZodObject;

  constructor(
    @inject(MODULE.INFRA.ENGINE.VALIDATION.ZOD)
    private readonly engine: ZOD,
  ) {}

  validate(value: any): ValidationResult<ZodError, Record<string, any>> {
    const result = this.schema.safeParse(value);
    return {
      error: result.error,
      isValid: result.success,
      value: result.data,
    };
  }

  validateAsync(
    value: any,
  ): Promise<ValidationResult<ZodError, Record<string, any>>> {
    throw new Error("Method not implemented.");
  }
  parse(value: any) {
    throw new Error("Method not implemented.");
  }
  setSchema(schema: any): void {
    this.schema = schema as ZodObject;
  }
}
