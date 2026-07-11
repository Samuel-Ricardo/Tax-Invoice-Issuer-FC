import { inject, injectable } from "inversify";
import {
  ValidationResult,
  Validator,
} from "../../../domain/validator/validator.interface";
import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { MODULE } from "../../../app.registry";
import { ZodError, ZodObject, ZodSafeParseResult } from "zod";
import { InvalidDataError } from "../../../../@lib/error/validation/data.error";

@injectable()
export class ZodValidator<T> implements Validator<T> {
  private schema: ZodObject;

  constructor(
    @inject(MODULE.INFRA.ENGINE.VALIDATION.ZOD)
    public readonly engine: ZOD,
  ) {}

  validate(
    value: T,
    schema?: ZodObject,
  ): ValidationResult<ZodError, Record<string, any>> {
    const result = (schema || this.schema).safeParse(value);
    this.handleError(result);
    return {
      error: result.error,
      isValid: result.success,
      value: result.data,
    };
  }

  async validateAsync(
    value: T,
    schema?: ZodObject,
  ): Promise<ValidationResult<ZodError, Record<string, any>>> {
    const result = await (schema || this.schema).safeParseAsync(value);
    this.handleError(result);
    return {
      error: result.error,
      isValid: result.success,
      value: result.data,
    };
  }

  setRules(schema: any): void {
    this.schema = schema as ZodObject;
  }

  private handleError(result: ZodSafeParseResult<Record<string, unknown>>) {
    if (!result.success)
      throw result.error
        ? new InvalidDataError(result.error.message, 422, result.error)
        : new InvalidDataError();
  }
}
