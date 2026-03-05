import { inject, injectable } from "inversify";
import { SQLDatabaseConnection } from "../sql.connection";
import pgp, { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { MODULE } from "../../../../../../app.registry";
import {
  AsyncLogger,
  LoggableAsync,
} from "../../../../../../../@decorators/async/logger.decorator";
import { OutputLogger } from "../../../../../../../@decorators/log/data.decorator";

@AsyncLogger()
@injectable()
export class PgPromiseConnectionAdapter
  extends LoggableAsync
  implements SQLDatabaseConnection
{
  private connection: IDatabase<object, IClient>;

  constructor(
    @inject(MODULE.INFRA.CONFIG.ENV.DATABASE.URL)
    url: string,
  ) {
    super();

    this.connect(url);
  }

  private connect(url: string) {
    try {
      this.connection = pgp()(url);
      this.info({ context: "DATABASE", message: "Connected with PostgreSQL" });
    } catch (error) {
      this.error({
        context: "DATABASE",
        message: "Error on connect with PostgreSQL",
        error,
      });
    }
    //  this.connection = pgp()(url);
  }

  @OutputLogger("QUERY")
  async query(statement: string, params: any): Promise<any> {
    this.info(
      {
        context: "DATABASE",
        message: `Realizing Query`,
      },
      { statement, params },
    );
    return await this.connection.query(statement, params);
  }

  async close(): Promise<void> {
    this.info({ context: "DATABASE", message: "Closing connection" });
    await this.connection.$pool.end();
  }
}
