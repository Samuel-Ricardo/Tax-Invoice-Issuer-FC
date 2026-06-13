import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { ContractRepositorySQL } from "../../../../../src/@modules/application/repository/sql/contract.repository";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { PgPromiseConnectionAdapter } from "../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

export const mockContractRepositorySQL = mockDeep<ContractRepositorySQL>();

export const simulateContractRepositorySQL = (module: ResolutionContext) => {
  const engine = module.get(
    TEST_MODULE.INFRA.ENGINE.DATABASE.SQL.POSTGRES.PGPROMISE.MOCK,
  ) as DeepMockProxy<PgPromiseConnectionAdapter>;

  return {
    engine,
    repository: new ContractRepositorySQL(engine),
  };
};
