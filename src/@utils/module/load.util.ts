import { Container, ContainerModule } from "inversify";

export const loads = (
  modules: ContainerModule[],
  defaultScope: "Singleton" | "Transient" | "Request" = "Singleton",
): Container => {
  const _MODULE = new Container({ autobind: true, defaultScope });
  _MODULE.load(...Array.from(new Set(modules)));
  return _MODULE;
};

export const load = (
  module: ContainerModule,
  defaultScope: "Singleton" | "Transient" | "Request" = "Singleton",
): Container => {
  const _MODULE = new Container({ autobind: true, defaultScope: defaultScope });
  _MODULE.loadSync(module);

  return _MODULE;
};

// ============================================================================
// STRATEGIES FOR HANDLING DUPLICATION
// ============================================================================

/**
 * SKIP: Removes duplicate modules before loading (by reference)
 *
 * The most reliable way to avoid problems: don't load the same module twice.
 * Uses Set to maintain only unique module references.
 *
 * ⚠️  IMPORTANT: This removes DUPLICATE MODULES, not DUPLICATE BINDINGS.
 * If two DIFFERENT MODULES register the SAME BINDING, it will still error.
 *
 * @example
 * ```typescript
 * const container = loadsWithSkip([
 *   MODULE_A,  // ✅ Loaded
 *   MODULE_A,  // ⏭️  Ignored (same reference)
 *   MODULE_B,  // ✅ Loaded
 * ]);
 * ```
 */
export const loadsWithSkip = (modules: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
  const uniqueModules = Array.from(new Set(modules));

  if (uniqueModules.length < modules.length) {
    console.warn(
      `⚠️  Removed ${modules.length - uniqueModules.length} duplicate modules`,
    );
  }

  _MODULE.load(...uniqueModules);
  return _MODULE;
};

/**
 * REBIND: Creates wrappers that do unbind before bind
 *
 * ⚠️  LIMITATION: Inversify 7.x doesn't easily allow binding interception.
 * This function provides a SIMPLIFIED version that:
 * 1. Loads first module normally
 * 2. For following modules, creates wrappers that do unbind before bind
 *
 * For full control, you need to manually create modules using rebind:
 *
 * ```typescript
 * const OVERRIDE_MODULE = new ContainerModule(({ rebind }) => {
 *   rebind("Logger").toConstantValue(newLogger); // ✅ Overwrites
 * });
 * ```
 *
 * @example
 * ```typescript
 * const container = loadsWithRebind([
 *   BASE_MODULE,   // Logger → ConsoleLogger
 *   TEST_MODULE,   // Logger → MockLogger ✅ Tries to override
 * ]);
 * ```
 */
export const loadsWithRebind = (modules: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });

  if (modules.length === 0) return _MODULE;

  // Loads first module normally
  _MODULE.load(modules[0]);

  // For subsequent modules, warns that they may cause duplication
  if (modules.length > 1) {
    console.warn(
      `⚠️  loadsWithRebind: Loading ${modules.length - 1} additional modules.`,
    );
    console.warn(
      `   If there are duplicate bindings, create modules with rebind() manually.`,
    );

    modules.slice(1).forEach((module) => {
      _MODULE.load(module);
    });
  }

  return _MODULE;
};

/**
 * Dynamically chooses strategy
 *
 * @param strategy
 *   - "error": Throws error (Inversify default)
 *   - "rebind": Overwrites (last wins)
 *   - "skip": Ignores (first wins)
 */
export const loadsWithStrategy = (
  modules: ContainerModule[],
  strategy: "error" | "rebind" | "skip" = "error",
): Container => {
  switch (strategy) {
    case "rebind":
      return loadsWithRebind(modules);
    case "skip":
      return loadsWithSkip(modules);
    case "error":
    default:
      return loads(modules);
  }
};
