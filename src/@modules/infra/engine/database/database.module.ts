import { ContainerModule } from "inversify";
import { SQLDatabaseConnection } from "./connection/sql/sql.connection";
import { DATABASE_ENGINE_REGISTRY } from "./database.registry";
import { PgPromiseConnectionAdapter } from "./connection/sql/postgres/pgpromise.engine";

export const DATABASE_ENGINE_MODULE = new ContainerModule(({ bind }) => {
  bind<SQLDatabaseConnection>(
    DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE,
  ).to(PgPromiseConnectionAdapter);
});
