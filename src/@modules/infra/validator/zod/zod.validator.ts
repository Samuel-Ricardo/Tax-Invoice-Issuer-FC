import { inject, injectable } from "inversify";
import {
  ValidationResult,
  Validator,
} from "../../../domain/validator/validator.interface";
import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { MODULE } from "../../../app.registry";
import { ZodError, ZodObject } from "zod";

@injectable()
export class ZodValidator<T> implements Validator<T> {
  private schema: ZodObject;

  constructor(
    @inject(MODULE.INFRA.ENGINE.VALIDATION.ZOD)
    public readonly engine: ZOD,
  ) {}

  validate(value: T): ValidationResult<ZodError, Record<string, any>> {
    const result = this.schema.safeParse(value);
    return {
      error: result.error,
      isValid: result.success,
      value: result.data,
    };
  }

  async validateAsync(
    value: T,
  ): Promise<ValidationResult<ZodError, Record<string, any>>> {
    const result = await this.schema.safeParseAsync(value);
    return {
      error: result.error,
      isValid: result.success,
      value: result.data,
    };
  }

  setSchema(schema: any): void {
    this.schema = schema as ZodObject;
  }
}
