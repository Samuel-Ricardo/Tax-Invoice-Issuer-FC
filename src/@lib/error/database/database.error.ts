import { AppError } from "../app.error";

export class DatabsaeError extends AppError {
  constructor(
    public readonly message: string = "Database Error",
    public readonly status: number = 500,
    public readonly data?: any,
    public readonly error: boolean = true,
  ) {
    super(message, status, data, error);
  }
}
