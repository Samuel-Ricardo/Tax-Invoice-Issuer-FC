import { Container, ContainerModule } from "inversify";

export const merge = (module: ContainerModule[]): Container => {
  const _MODULE = new Container({ autobind: true });
  _MODULE.load(...module);
  return _MODULE;
};
