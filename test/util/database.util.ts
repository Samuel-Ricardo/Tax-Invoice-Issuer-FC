import { CONTROLLER_CONTAINER } from "../../src/@modules/application/controller/controller.factory";
import { SQLDatabaseConnection } from "../../src/@modules/infra/engine/database/connection/sql/sql.connection";
import { DATABASE_ENGINE_REGISTRY } from "../../src/@modules/infra/engine/database/database.registry";

export async function shutdownDatabase() {
  try {
    const db = CONTROLLER_CONTAINER.get<SQLDatabaseConnection>(
      DATABASE_ENGINE_REGISTRY.SQL.POSTGRES.PGPROMISE,
    );
    await db.close();
  } catch (error) {
    console.error("Erro ao fechar conexão do banco (teardown):", error);
  }
}
