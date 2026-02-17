import { inject, injectable } from "inversify";
import { PaymentRepository } from "../../../domain/repository/payment.repository";
import { ListPaymentDTO } from "../../../domain/DTO/payment/list.dto";
import Payment from "../../../domain/entity/payment.entity";
import { SQLDatabaseConnection } from "../../../infra/engine/database/connection/sql/sql.connection";
import { MODULE } from "../../../app.registry";

@injectable()
export class PaymentRepositorySQL implements PaymentRepository {
  constructor(
    @inject(MODULE.INFRA.ENGINE.DATABASE.SQL.POSTGRES.PGPROMISE)
    private readonly database: SQLDatabaseConnection,
  ) {}

  async list({ contrarId }: ListPaymentDTO) {
    const payments: Payment[] = [];
    const paymentsDB = await this.database.query(
      "SELECT * FROM sam.payment WHERE id_contract = $1",
      [contrarId],
    );

    for (const p of paymentsDB) {
      payments.push(new Payment(p.id_payment, p.date, parseFloat(p.amount)));
    }

    return payments;
  }
}
