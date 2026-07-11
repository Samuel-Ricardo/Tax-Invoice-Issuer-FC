import { Contract } from "../../src/@modules/domain/entity/contract.entity";
import Payment from "../../src/@modules/domain/entity/payment.entity";
import { Invoice } from "../../src/@modules/domain/entity/invoice.entity";

export class TestFixtures {
  static createContract(overrides?: Partial<Contract>): Contract {
    const contract = new Contract(
      overrides?.idContract ?? "4224a279-c162-4283-86f5-1095f559b08c",
      overrides?.description ?? "Prestação de serviços escolares",
      overrides?.amount ?? 6000,
      overrides?.periods ?? 12,
      overrides?.date ?? new Date("2022-01-01T10:00:00"),
    );
    return contract;
  }

  static createPayment(overrides?: {
    idPayment?: string;
    date?: Date;
    amount?: number;
  }): Payment {
    return new Payment(
      overrides?.idPayment ?? "c931d9db-c8d8-44d4-8861-b3d6b734c64e",
      overrides?.date ?? new Date("2022-01-05T10:00:00"),
      overrides?.amount ?? 6000,
    );
  }

  static createInvoice(overrides?: { date?: Date; amount?: number }): Invoice {
    return new Invoice(
      overrides?.date ?? new Date("2022-01-01T10:00:00"),
      overrides?.amount ?? 500,
    );
  }

  static createContractWithPayments(): Contract {
    const contract = this.createContract();
    contract.addPayment(this.createPayment());
    return contract;
  }
}
