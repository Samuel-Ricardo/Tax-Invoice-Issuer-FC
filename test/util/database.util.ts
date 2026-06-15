import { SQLDatabaseConnection } from "../../src/@modules/infra/engine/database/connection/sql/sql.connection";
import { loads } from "../../src/@utils/module/load.util";
import { INFRA_MODULE } from "../../src/@modules/infra/infra.module";
import { DATABASE_ENGINE_REGISTRY } from "../../src/@modules/infra/engine/database/database.registry";

let _dbConnection: SQLDatabaseConnection | null = null;

function getDbConnection(): SQLDatabaseConnection {
  if (!_dbConnection) {
    const container = loads(INFRA_MODULE);
    _dbConnection = container.get<SQLDatabaseConnection>(
      DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE,
    );
  }
  return _dbConnection;
}

export async function shutdownDatabase() {
  try {
    const db = getDbConnection();
    await db.close();
    _dbConnection = null;
  } catch (error) {
    console.error("Erro ao fechar conexão do banco (teardown):", error);
  }
}
