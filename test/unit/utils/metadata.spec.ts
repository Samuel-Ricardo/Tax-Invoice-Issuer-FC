import "reflect-metadata";
import { preserveMetadata } from "../../../src/@utils/decorator/metadata.util";
import { injectable } from "inversify";

describe("[METADATA] - [UTIL]", () => {
  // ============================================================================
  // preserveMetadata - Class metadata copying
  // ============================================================================

  it("[UNIT] | [METADATA] - preserveMetadata > copies class-level metadata from source to target", () => {
    @injectable()
    class SourceClass {
      constructor() {}
    }

    class TargetClass {
      constructor() {}
    }

    preserveMetadata(SourceClass, TargetClass);

    // Target should now have injectable metadata from source
    const targetKeys = Reflect.getMetadataKeys(TargetClass);
    const sourceKeys = Reflect.getMetadataKeys(SourceClass);
    expect(targetKeys).toEqual(sourceKeys);
  });

  it("[UNIT] | [METADATA] - preserveMetadata > copies method-level metadata", () => {
    class SourceClass {
      myMethod() {}
    }
    // Manually define metadata on a prototype method
    Reflect.defineMetadata(
      "test-key",
      "test-value",
      SourceClass.prototype,
      "myMethod",
    );

    class TargetClass {
      myMethod() {}
    }

    preserveMetadata(SourceClass, TargetClass);

    const metadata = Reflect.getMetadata(
      "test-key",
      TargetClass.prototype,
      "myMethod",
    );
    expect(metadata).toBe("test-value");
  });

  it("[UNIT] | [METADATA] - preserveMetadata > handles class with no metadata gracefully", () => {
    class EmptySource {}
    class EmptyTarget {}

    // Should not throw even when no metadata exists
    expect(() => preserveMetadata(EmptySource, EmptyTarget)).not.toThrow();
  });

  it("[UNIT] | [METADATA] - preserveMetadata > does not throw when source has only prototype methods", () => {
    class SimpleSource {
      compute() {
        return 42;
      }
    }
    class SimpleTarget {
      compute() {
        return 0;
      }
    }

    expect(() => preserveMetadata(SimpleSource, SimpleTarget)).not.toThrow();
  });

  it("[UNIT] | [METADATA] - preserveMetadata > copies multiple class-level metadata keys", () => {
    class Source {}
    Reflect.defineMetadata("key1", "value1", Source);
    Reflect.defineMetadata("key2", "value2", Source);

    class Target {}

    preserveMetadata(Source, Target);

    expect(Reflect.getMetadata("key1", Target)).toBe("value1");
    expect(Reflect.getMetadata("key2", Target)).toBe("value2");
  });
});
