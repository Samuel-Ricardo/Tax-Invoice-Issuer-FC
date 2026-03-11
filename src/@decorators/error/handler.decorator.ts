import { AppError } from "../../@lib/error/app.error";
import { log } from "../../@lib/log.lib";
import { IError } from "../../@types/lib/error.type";

export function ErrorHandler(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (...args: any[]) => any;

    descriptor.value = function (...args: any[]) {
      try {
        return original.apply(this, args);
      } catch (error) {
        return handleError(error);
      }
    } as any;
  };
}

function handleError(error: Error): IError {
  log.error({ context: "ERROR", message: error.message, error });

  if (error instanceof AppError) return error.toStruct();

  return new AppError(error.message).toStruct();
}
