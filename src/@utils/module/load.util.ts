import { Container, ContainerModule } from "inversify";

export const merge = (module: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
  _MODULE.load(...module);
  return _MODULE;
};

export const load = (module: ContainerModule, singleton = true): Container => {
  const _MODULE = new Container(
    singleton
      ? { autobind: true, defaultScope: "Singleton" }
      : { autobind: true },
  );
  _MODULE.loadSync(module);
  return _MODULE;
};
