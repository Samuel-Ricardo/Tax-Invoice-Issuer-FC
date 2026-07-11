import { APPLICATION_FACTORY } from "./application/application.factory";
import { INFRA_FACTORY } from "./infra/infra.factory";

export const MODULES = {
  INFRA: INFRA_FACTORY,
  APPLICATION: APPLICATION_FACTORY,
};
