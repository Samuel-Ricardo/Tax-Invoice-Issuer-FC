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

export function OutputLogger(
  config?: LogInput,
  ...data: any[]
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      const output = await original.apply(this, input);
      const context = config?.context || "DATA::OUTPUT";
      const message = config.message;

      console.info(`[${context}] | ${message}`, { output }, ...data);
      return output;
    } as any;

    return descriptor;
  };
}
