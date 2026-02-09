import { load } from "../../../../@utils/module/load.util";
import { SQLDatabaseConnection } from "./connection/sql/sql.connection";
import { DATABASE_ENGINE_MODULE } from "./database.module";
import { DATABASE_ENGINE_REGISTRY } from "./database.registry";

const _MODULE = load(DATABASE_ENGINE_MODULE);

export const DATABASE_ENGINE_FACTORY = {
  SQL: {
    POSTGRES: {
      PGPROMISE: () =>
        _MODULE.get<SQLDatabaseConnection>(
          DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE,
        ),
    },
  },
};
