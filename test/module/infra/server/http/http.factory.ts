import { loads } from "../../../../../src/@utils/module/load.util";
import { TEST_HTTP_SERVER_MODULE } from "./http.module";
import { TEST_HTTP_SERVER_REGISTRY } from "./http.registry";

const _MODULE = loads(TEST_HTTP_SERVER_MODULE);

export const TEST_HTTP_SERVER_FACTORY = {
  SERVER: {
    HTTP: {
      EXPRESS: {
        MOCK: () => _MODULE.get(TEST_HTTP_SERVER_REGISTRY.HTTP.EXPRESS.MOCK),
        SIMULATE: () =>
          _MODULE.get(TEST_HTTP_SERVER_REGISTRY.HTTP.EXPRESS.SIMULATE),
      },
    },
  },
};
