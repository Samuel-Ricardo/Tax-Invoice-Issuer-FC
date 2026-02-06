export function InputLogger(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      console.log({ input });
      return await original.call(this, input);
    } as any;

    return descriptor;
  };
}

export function OutputLogger(): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      const output = await original.call(this, input);
      console.log({ output });
      return output;
    } as any;

    return descriptor;
  };
}

export function DataLogger(): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any[]) {
      console.log({ args });

      const result = await original.apply(this, args);
      console.log({ result });

      return result;
    };
  };
}
