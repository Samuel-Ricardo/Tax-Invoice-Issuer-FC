import { DeepMockProxy } from "jest-mock-extended";
import { loads } from "../../../../../src/@utils/module/load.util";

import { TEST_DATABASE_ENGINE_MODULE } from "./database.module";
import { TEST_DATABASE_ENGINE_REGISTRY } from "./database.registry";
import { PgPromiseConnectionAdapter } from "../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

const _MODULE = loads(TEST_DATABASE_ENGINE_MODULE, "Transient");

export const TEST_DATABASE_ENGINE_FACTORY = {
  SQL: {
    POSTGRES: {
      PGPROMISE: {
        MOCK: () =>
          _MODULE.get<DeepMockProxy<PgPromiseConnectionAdapter>>(
            TEST_DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE.MOCK,
          ),
        SIMULATE: () =>
          _MODULE.get<PgPromiseConnectionAdapter>(
            TEST_DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE.SIMULATE,
          ),
      },
    },
  },
};
