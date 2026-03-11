import { AppError } from "../app.error";

export class NoDataProvidedError extends AppError {
  constructor(
    public readonly message: string = "No Data Provided",
    public readonly status: number = 422,
    public readonly data?: any,
    public readonly error: boolean = true,
  ) {
    super(message, status, data, error);
  }
}
