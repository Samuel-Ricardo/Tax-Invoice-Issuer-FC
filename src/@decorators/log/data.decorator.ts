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

      console.info(`[${context}] | ${message} [INPUT]`, { input }, ...data);
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

      try {
        console.info(`[${context}] | ${message} [OUTPUT]`, { output }, ...data);
        return output;
      } catch (error) {
        console.error(
          `[${context}] | ${message} [ERROR]`,
          { error: error instanceof Error ? error.message : error },
          ...data,
        );
        throw error;
      }
    } as any;

    return descriptor;
  };
}

export function DataLogger(config?: LogInput, ...data: any[]): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any[]) {
      const context = config?.context || "DATA";
      const message = config.message;

      console.info(`[${context}] | ${message} [INPUT]`, { args }, ...data);

      try {
        const result = await original.apply(this, args);
        console.info(`[${context}] | ${message} [OUTPUT]`, { result }, ...data);
        return result;
      } catch (error) {
        console.error(
          `[${context}] | ${message} [ERROR]`,
          { error: error instanceof Error ? error.message : error },
          ...data,
        );
        throw error;
      }
    };
  };
}
