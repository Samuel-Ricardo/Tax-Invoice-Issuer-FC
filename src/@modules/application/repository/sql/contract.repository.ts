import { inject, injectable } from "inversify";
import { ContractRepository } from "../../../domain/repository/contract.repository";
import { SQLDatabaseConnection } from "../../../infra/engine/database/connection/sql/sql.connection";
import { MODULE } from "../../../app.registry";
import { Contract } from "../../../domain/entity/contract.entity";
//import { OutputLogger } from "../../../../@decorators/log/data.decorator";

@injectable()
export class ContractRepositorySQL implements ContractRepository {
  constructor(
    @inject(MODULE.INFRA.ENGINE.DATABASE.SQL.POSTGRES.PGPROMISE)
    private readonly database: SQLDatabaseConnection,
  ) {}

  //  @OutputLogger({ context: "REPOSITORY", message: "CONTRACT LIST" })
  async list() {
    const contracts: Contract[] = [];
    const contractsDB = await this.database.query(
      "SELECT * FROM sam.contract",
      [],
    );

    for (const c of contractsDB) {
      contracts.push(
        new Contract(
          c.id_contract,
          c.description,
          parseFloat(c.amount),
          c.periods,
          c.date,
        ),
      );
    }

    return contracts;
  }
}
