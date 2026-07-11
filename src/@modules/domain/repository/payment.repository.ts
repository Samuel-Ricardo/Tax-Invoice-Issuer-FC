import { ListPaymentDTO } from "../DTO/payment/list.dto";
import Payment from "../entity/payment.entity";

export interface PaymentRepository {
  list(DTO: ListPaymentDTO): Promise<Payment[]>;
}
