export function InputLogger(label?: string): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      console.log({ label, input });
      return await original.apply(this, input);
    } as any;

    return descriptor;
  };
}

export function OutputLogger(label?: string): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      ...input: any[]
    ) => Promise<any> | any;

    descriptor.value = async function (...input: any[]) {
      const output = await original.apply(this, input);
      console.log({ label, output });
      return output;
    } as any;

    return descriptor;
  };
}

//TODO: CREATE LOGGER PARAMS DTO
export function DataLogger(label?: string): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any[]) {
      console.log({ label, args });

      const result = await original.apply(this, args);
      console.log({ label, result });

      return result;
    };
  };
}
