import { ContainerModule } from "inversify";
import { TEST_DATABASE_ENGINE_REGISTRY } from "./database.registry";
import { mockPgPromiseConnection } from "./connection/sql/postgres/pgpromise.engine";
import { PgPromiseConnectionAdapter } from "../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";
import { TEST_CONFIG_MODULE } from "../../config/config.module";

export const TEST_DATABASE_ENGINE_MODULE = [
  TEST_CONFIG_MODULE,

  new ContainerModule(({ bind }) => {
    bind(
      TEST_DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE.MOCK,
    ).toDynamicValue(mockPgPromiseConnection);

    bind(TEST_DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE.SIMULATE).to(
      PgPromiseConnectionAdapter,
    );
  }),
];
