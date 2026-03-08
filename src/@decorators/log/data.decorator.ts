import { LogInput } from "../../@types/decorator/log/input.type";

export function InputLogger(
  config?: LogInput,
  ...data: any[]
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      const context = config?.context || "DATA::INPUT";
      const message = config.message;

      console.info(`[${context}] | ${message}`, { input }, ...data);
      return await original.apply(this, input);
    } as any;

    return descriptor;
  };
}
