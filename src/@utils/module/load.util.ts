import { Container, ContainerModule } from "inversify";

export const loads = (module: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
  _MODULE.load(...module);
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
