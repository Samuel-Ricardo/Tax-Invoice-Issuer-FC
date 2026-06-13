import { TEST_APPLICATION_MODULE } from "./application/application.module";
import { TEST_INFRA_MODULE } from "./infra/infra.module";

export const TEST_APP_MODULE = [
  ...TEST_INFRA_MODULE,
  ...TEST_APPLICATION_MODULE,
];
