import { log } from "../../@lib/log.lib";
import { Specification } from "../../@modules/domain/specification/specification.interface";

export function Validate(
  specificationOrKey: Specification<any> | string,
  ...data: any[]
): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Resolve specification at runtime
      const specification =
        typeof specificationOrKey === "string"
          ? this[specificationOrKey]
          : specificationOrKey;

      log.info(
        { context: "VALIDATION", message: "Validating input:" },
        { body: args[1] },
      );

      //eslint-disable-next-line
      try {
        const body = args[1];
        const result = specification.isSatisfiedBy(body);
        if (!result)
          log.info(
            { context: "VALIDATION", message: "Input is invalid" },
            { body },
          );
      } catch (error) {
        throw error;
      }

      return original.apply(this, args);
    };
  };
}
