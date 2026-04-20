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
        { data },
      );

      //eslint-disable-next-line
      try {
        const result = specification.isSatisfiedBy(data["body"]);
        if (!result)
          log.info(
            { context: "VALIDATION", message: "Input is valid" },
            { data },
          );
      } catch (error) {
        throw error;
      }

      return original.apply(this, args);
    };
  };
}
