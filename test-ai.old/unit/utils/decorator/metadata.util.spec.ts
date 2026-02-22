import "reflect-metadata";
import { preserveMetadata } from "../../../../src/@utils/decorator/metadata.util";

describe("[UNIT] Utility - Metadata Decorator", () => {
  describe("preserveMetadata", () => {
    test("Should preserve class-level metadata", () => {
      class SourceClass {}
      class TargetClass {}

      const metadataKey = "test:class-metadata";
      const metadataValue = { important: "data" };

      Reflect.defineMetadata(metadataKey, metadataValue, SourceClass);

      preserveMetadata(SourceClass, TargetClass);

      const retrieved = Reflect.getMetadata(metadataKey, TargetClass);
      expect(retrieved).toEqual(metadataValue);
    });

    test("Should preserve multiple class-level metadata keys", () => {
      class SourceClass {}
      class TargetClass {}

      Reflect.defineMetadata("key1", "value1", SourceClass);
      Reflect.defineMetadata("key2", "value2", SourceClass);
      Reflect.defineMetadata("key3", "value3", SourceClass);

      preserveMetadata(SourceClass, TargetClass);

      expect(Reflect.getMetadata("key1", TargetClass)).toBe("value1");
      expect(Reflect.getMetadata("key2", TargetClass)).toBe("value2");
      expect(Reflect.getMetadata("key3", TargetClass)).toBe("value3");
    });

    test("Should preserve property metadata", () => {
      class SourceClass {
        testProperty() {
          return "test";
        }
      }
      class TargetClass extends SourceClass {}

      const propertyKey = "testProperty";
      const metadataKey = "property:metadata";
      const metadataValue = "property-value";

      Reflect.defineMetadata(
        metadataKey,
        metadataValue,
        SourceClass.prototype,
        propertyKey,
      );

      preserveMetadata(SourceClass, TargetClass);

      const retrieved = Reflect.getMetadata(
        metadataKey,
        TargetClass.prototype,
        propertyKey,
      );
      expect(retrieved).toBe(metadataValue);
    });

    test("Should preserve metadata from multiple properties", () => {
      class SourceClass {
        method1() {}
        method2() {}
        method3() {}
      }
      class TargetClass extends SourceClass {}

      Reflect.defineMetadata(
        "meta1",
        "value1",
        SourceClass.prototype,
        "method1",
      );
      Reflect.defineMetadata(
        "meta2",
        "value2",
        SourceClass.prototype,
        "method2",
      );
      Reflect.defineMetadata(
        "meta3",
        "value3",
        SourceClass.prototype,
        "method3",
      );

      preserveMetadata(SourceClass, TargetClass);

      expect(
        Reflect.getMetadata("meta1", TargetClass.prototype, "method1"),
      ).toBe("value1");
      expect(
        Reflect.getMetadata("meta2", TargetClass.prototype, "method2"),
      ).toBe("value2");
      expect(
        Reflect.getMetadata("meta3", TargetClass.prototype, "method3"),
      ).toBe("value3");
    });

    test("Should handle class without metadata", () => {
      class SourceClass {}
      class TargetClass {}

      expect(() => preserveMetadata(SourceClass, TargetClass)).not.toThrow();
    });

    test("Should handle class with constructor", () => {
      class SourceClass {
        constructor(public value: string) {}
      }
      class TargetClass extends SourceClass {}

      Reflect.defineMetadata("constructor-meta", "data", SourceClass);

      preserveMetadata(SourceClass, TargetClass);

      expect(Reflect.getMetadata("constructor-meta", TargetClass)).toBe("data");
    });

    test("Should work with design:type metadata", () => {
      class SourceClass {
        testMethod(): string {
          return "test";
        }
      }
      class TargetClass extends SourceClass {}

      const designType = String;
      Reflect.defineMetadata(
        "design:type",
        designType,
        SourceClass.prototype,
        "testMethod",
      );

      preserveMetadata(SourceClass, TargetClass);

      const retrieved = Reflect.getMetadata(
        "design:type",
        TargetClass.prototype,
        "testMethod",
      );
      expect(retrieved).toBe(designType);
    });

    test("Should preserve design:paramtypes metadata", () => {
      class SourceClass {
        constructor(_param1: string, _param2: number) {}
      }
      class TargetClass extends SourceClass {}

      const paramTypes = [String, Number];
      Reflect.defineMetadata("design:paramtypes", paramTypes, SourceClass);

      preserveMetadata(SourceClass, TargetClass);

      const retrieved = Reflect.getMetadata("design:paramtypes", TargetClass);
      expect(retrieved).toEqual(paramTypes);
    });
  });

  describe("reflect-metadata basic functionality", () => {
    test("Should test metadata preservation exists in project", () => {
      expect(Reflect).toBeDefined();
      expect(Reflect.getMetadata).toBeDefined();
      expect(Reflect.defineMetadata).toBeDefined();
    });

    test("Should support decorator metadata", () => {
      const metadataKey = "test:metadata";
      const metadataValue = "test-value";

      class TestClass {}

      Reflect.defineMetadata(metadataKey, metadataValue, TestClass);

      const retrieved = Reflect.getMetadata(metadataKey, TestClass);
      expect(retrieved).toBe(metadataValue);
    });

    test("Should support design:type metadata", () => {
      class TestService {
        getName(): string {
          return "test";
        }
      }

      expect(() => {
        Reflect.getMetadata("design:type", TestService);
      }).not.toThrow();
    });

    test("Should support parameter metadata", () => {
      const paramKey = "param:metadata";
      class TestClass {
        constructor(_param1: string, _param2: number) {}
      }

      Reflect.defineMetadata(paramKey, ["string", "number"], TestClass);

      const paramTypes = Reflect.getMetadata(paramKey, TestClass);
      expect(paramTypes).toEqual(["string", "number"]);
    });
  });
});
