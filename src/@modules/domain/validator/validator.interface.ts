import { Specification } from "../specification/specification.interface";

export interface ValidationRule<T> {
  validate(value: T): boolean;
  specification(): Specification<T>;
}

export interface ValidationResult<E, V> {
  isValid: boolean;
  error: E;
  value?: V;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  constraint?: string;
}

export interface Validator<T> {
  validate(value: T): ValidationResult<any, any>;
  validateAsync(value: T): Promise<ValidationResult<any, any>>;
  setRules(rules: any): void;
}
