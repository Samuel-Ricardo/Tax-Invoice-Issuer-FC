import { DeepMockProxy } from "jest-mock-extended";
import { PaymentRepositorySQL } from "../../../../src/@modules/application/repository/sql/payment.repository";
import { PgPromiseConnectionAdapter } from "../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

export interface SimulatedPaymentRepository {
  repository: PaymentRepositorySQL;
  engine: DeepMockProxy<PgPromiseConnectionAdapter>;
}
