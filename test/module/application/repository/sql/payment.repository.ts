import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PaymentRepositorySQL } from "../../../../../src/@modules/application/repository/sql/payment.repository";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { PgPromiseConnectionAdapter } from "../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

export const mockPaymentRepositorySQL = mockDeep<PaymentRepositorySQL>();

export const simulatePaymentRepositorySQL = (module: ResolutionContext) => {
  const engine = module.get(
    TEST_MODULE.INFRA.ENGINE.DATABASE.SQL.POSTGRES.PGPROMISE.MOCK,
  ) as DeepMockProxy<PgPromiseConnectionAdapter>;

  return {
    repository: new PaymentRepositorySQL(engine),
    engine,
  };
};
