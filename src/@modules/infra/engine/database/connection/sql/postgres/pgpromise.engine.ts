import { SQLDatabaseConnection } from "../sql.connection";

export class PgPromiseConnectionAdapter implements SQLDatabaseConnection {
  query(statement: string, params: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
