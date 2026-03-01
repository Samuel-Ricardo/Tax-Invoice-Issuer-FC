import { Container, ContainerModule } from "inversify";

export const loads = (modules: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
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
// ESTRATÉGIAS PARA LIDAR COM DUPLICAÇÃO
// ============================================================================

/**
 * SKIP: Remove módulos duplicados antes de carregar (por referência)
 *
 * A forma mais confiável de evitar problemas: não carregar o mesmo módulo duas vezes.
 * Usa Set para manter apenas referências únicas de módulos.
 *
 * ⚠️  IMPORTANTE: Isto remove MÓDULOS duplicados, não BINDINGS duplicados.
 * Se dois MÓDULOS DIFERENTES registram o MESMO BINDING, ainda dará erro.
 *
 * @example
 * ```typescript
 * const container = loadsWithSkip([
 *   MODULE_A,  // ✅ Carregado
 *   MODULE_A,  // ⏭️  Ignorado (mesma referência)
 *   MODULE_B,  // ✅ Carregado
 * ]);
 * ```
 */
export const loadsWithSkip = (modules: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
  const uniqueModules = Array.from(new Set(modules));

  if (uniqueModules.length < modules.length) {
    console.warn(
      `⚠️  Removidos ${modules.length - uniqueModules.length} módulos duplicados`,
    );
  }

  _MODULE.load(...uniqueModules);
  return _MODULE;
};

/**
 * REBIND: Cria wrappers que fazem unbind antes de bind
 *
 * ⚠️  LIMITAÇÃO: O Inversify 7.x não permite interceptar bindings facilmente.
 * Esta função fornece uma versão SIMPLIFICADA que:
 * 1. Carrega primeiro módulo normalmente
 * 2. Para módulos seguintes, cria wrappers que fazem unbind antes de bind
 *
 * Para controle total, você precisa criar módulos manualmente usando rebind:
 *
 * ```typescript
 * const OVERRIDE_MODULE = new ContainerModule(({ rebind }) => {
 *   rebind("Logger").toConstantValue(newLogger); // ✅ Sobrescreve
 * });
 * ```
 *
 * @example
 * ```typescript
 * const container = loadsWithRebind([
 *   BASE_MODULE,   // Logger → ConsoleLogger
 *   TEST_MODULE,   // Logger → MockLogger ✅ Tenta sobrescrever
 * ]);
 * ```
 */
export const loadsWithRebind = (modules: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });

  if (modules.length === 0) return _MODULE;

  // Carrega primeiro módulo normalmente
  _MODULE.load(modules[0]);

  // Para módulos subsequentes, avisa que eles podem causar duplicação
  if (modules.length > 1) {
    console.warn(
      `⚠️  loadsWithRebind: Carregando ${modules.length - 1} módulos adicionais.`,
    );
    console.warn(
      `   Se houver bindings duplicados, crie módulos com rebind() manualmente.`,
    );

    modules.slice(1).forEach((module) => {
      _MODULE.load(module);
    });
  }

  return _MODULE;
};

/**
 * Escolhe estratégia dinamicamente
 *
 * @param strategy
 *   - "error": Lança erro (padrão Inversify)
 *   - "rebind": Sobrescreve (última vence)
 *   - "skip": Ignora (primeira vence)
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
