import { IError } from "../../@types/lib/error.type";

export class AppError extends Error implements IError {
  constructor(
    public readonly message: string,
    public readonly status: number = 500,
    public readonly data?: any,
    public readonly error: boolean = true,
  ) {
    super(message);
  }

  toStruct(): IError {
    return {
      error: this.error,
      message: this.message,
      status: this.status,
      data: this.data,
    };
  }

  static fromStruct(error: IError): AppError {
    return new AppError(error.message, error.status, error.data, error.error);
  }
}
