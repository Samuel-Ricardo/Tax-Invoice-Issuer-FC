import { inject, injectable } from "inversify";
import { SQLDatabaseConnection } from "../sql.connection";
import pgp, { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { MODULE } from "../../../../../../app.registry";

@injectable()
export class PgPromiseConnectionAdapter implements SQLDatabaseConnection {
  private connection: IDatabase<object, IClient>;

  constructor(
    @inject(MODULE.INFRA.CONFIG.ENV.DATABASE.URL)
    url: string,
  ) {
    this.connection = pgp()(url);
  }

  async query(statement: string, params: any): Promise<any> {
    return this.connection.query(statement, params);
  }
  async close(): Promise<void> {
    await this.connection.$pool.end();
  }
}
