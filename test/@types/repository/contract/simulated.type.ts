import { DeepMockProxy } from "jest-mock-extended";
import { ContractRepositorySQL } from "../../../../src/@modules/application/repository/sql/contract.repository";
import { PgPromiseConnectionAdapter } from "../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

export interface SimulatedContractRepository {
  repository: ContractRepositorySQL;
  engine: DeepMockProxy<PgPromiseConnectionAdapter>;
}
