import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import {
  load,
  loads,
  loadsWithSkip,
  loadsWithRebind,
  loadsWithStrategy,
} from "../../../src/@utils/module/load.util";

// ============================================================================
// HELPERS - Create test container modules
// ============================================================================

const KEY_A = Symbol.for("KEY_A");
const KEY_B = Symbol.for("KEY_B");
const KEY_C = Symbol.for("KEY_C");

const MODULE_A = new ContainerModule(({ bind }) => {
  bind(KEY_A).toConstantValue("value-A");
});

const MODULE_B = new ContainerModule(({ bind }) => {
  bind(KEY_B).toConstantValue("value-B");
});

const MODULE_C = new ContainerModule(({ bind }) => {
  bind(KEY_C).toConstantValue("value-C");
});

describe("[LOAD] - [UTILITY]", () => {
  // ============================================================================
  // load
  // ============================================================================

  it("[UNIT] | [UTIL] - load > creates container with a single module", () => {
    const container = load(MODULE_A);

    expect(container).toBeInstanceOf(Container);
    expect(container.get(KEY_A)).toBe("value-A");
  });

  it("[UNIT] | [UTIL] - load > uses Singleton scope by default", () => {
    const container = load(MODULE_A);

    const instance1 = container.get(KEY_A);
    const instance2 = container.get(KEY_A);

    expect(instance1).toBe(instance2);
  });

  it("[UNIT] | [UTIL] - load > accepts Transient scope", () => {
    const KEY_OBJ = Symbol.for("KEY_OBJ_TRANSIENT");
    const module = new ContainerModule(({ bind }) => {
      bind(KEY_OBJ).toDynamicValue(() => ({ id: Math.random() }));
    });

    const container = load(module, "Transient");

    expect(container).toBeInstanceOf(Container);
  });

  // ============================================================================
  // loads
  // ============================================================================

  it("[UNIT] | [UTIL] - loads > creates container with multiple modules", () => {
    const container = loads([MODULE_A, MODULE_B]);

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
  });

  it("[UNIT] | [UTIL] - loads > deduplicates modules (Set behavior)", () => {
    // Same module reference twice - Set removes duplicate
    const container = loads([MODULE_A, MODULE_A]);

    expect(container.get(KEY_A)).toBe("value-A");
  });

  // ============================================================================
  // loadsWithSkip
  // ============================================================================

  it("[UNIT] | [UTIL] - loadsWithSkip > loads unique modules normally", () => {
    const container = loadsWithSkip([MODULE_A, MODULE_B]);

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
  });

  it("[UNIT] | [UTIL] - loadsWithSkip > skips duplicate module references", () => {
    // Should warn but not throw
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const container = loadsWithSkip([MODULE_A, MODULE_A, MODULE_B]);

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Removed 1 duplicate modules"),
    );

    warnSpy.mockRestore();
  });

  it("[UNIT] | [UTIL] - loadsWithSkip > returns container even with no duplicates", () => {
    const container = loadsWithSkip([MODULE_A]);

    expect(container).toBeInstanceOf(Container);
    expect(container.get(KEY_A)).toBe("value-A");
  });

  // ============================================================================
  // loadsWithRebind
  // ============================================================================

  it("[UNIT] | [UTIL] - loadsWithRebind > loads single module", () => {
    const container = loadsWithRebind([MODULE_A]);

    expect(container.get(KEY_A)).toBe("value-A");
  });

  it("[UNIT] | [UTIL] - loadsWithRebind > returns empty container for empty array", () => {
    const container = loadsWithRebind([]);

    expect(container).toBeInstanceOf(Container);
  });

  it("[UNIT] | [UTIL] - loadsWithRebind > loads multiple distinct modules with warning", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const container = loadsWithRebind([MODULE_A, MODULE_B]);

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("[UNIT] | [UTIL] - loadsWithRebind > loads three modules with warning", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const container = loadsWithRebind([MODULE_A, MODULE_B, MODULE_C]);

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
    expect(container.get(KEY_C)).toBe("value-C");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Loading 2 additional modules"),
    );

    warnSpy.mockRestore();
  });

  // ============================================================================
  // loadsWithStrategy
  // ============================================================================

  it("[UNIT] | [UTIL] - loadsWithStrategy > strategy 'skip' deduplicates modules", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const container = loadsWithStrategy([MODULE_A, MODULE_A], "skip");

    expect(container.get(KEY_A)).toBe("value-A");
    warnSpy.mockRestore();
  });

  it("[UNIT] | [UTIL] - loadsWithStrategy > strategy 'rebind' loads multiple modules", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const container = loadsWithStrategy([MODULE_A, MODULE_B], "rebind");

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
    warnSpy.mockRestore();
  });

  it("[UNIT] | [UTIL] - loadsWithStrategy > strategy 'error' (default) loads modules normally", () => {
    const container = loadsWithStrategy([MODULE_A, MODULE_B], "error");

    expect(container.get(KEY_A)).toBe("value-A");
    expect(container.get(KEY_B)).toBe("value-B");
  });

  it("[UNIT] | [UTIL] - loadsWithStrategy > defaults to 'error' strategy when not specified", () => {
    const container = loadsWithStrategy([MODULE_A, MODULE_B]);

    expect(container).toBeInstanceOf(Container);
    expect(container.get(KEY_A)).toBe("value-A");
  });
});
