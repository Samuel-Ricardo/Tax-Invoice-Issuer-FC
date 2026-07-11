import { AppError } from "../app.error";

export class InvalidDataError extends AppError {
  constructor(
    public readonly message: string = "Invalid Data",
    public readonly status: number = 422,
    public readonly data?: any,
    public readonly error: boolean = true,
  ) {
    super(message, status, data, error);
  }
}
