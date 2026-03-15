import { AppError } from "../../@lib/error/app.error";
import { IError } from "../../@types/lib/error.type";

export function ErrorHandler(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        return handleError(error);
      }
    } as any;
  };
}

function handleError(error: Error): IError {
  if (error instanceof AppError) return error.toStruct();

  return new AppError(error.message).toStruct();
}
