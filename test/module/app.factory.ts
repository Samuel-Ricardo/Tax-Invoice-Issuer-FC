import { TEST_APPLICATION_FACTORY } from "./application/application.factory";
import { TEST_INFRA_FACTORY } from "./infra/infra.factory";

export const TEST_MODULES = {
  INFRA: TEST_INFRA_FACTORY,
  APPLICATION: TEST_APPLICATION_FACTORY,
};
