import { Specification } from "../specification/specification.interface";

export interface ValidationRule<T> {
  validate(value: T): boolean;
  specification(): Specification<T>;
}

export interface ValidationResult {
  isValid: boolean;
  error: ValidationError[];
  value?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  constraint?: string;
}

export interface Validator<T> {
  validate(value: T): ValidationResult;
  validateAsync(value: T): Promise<ValidationResult>;
  parse(value: any): T;
  setSchema(schema: any): void;
}
