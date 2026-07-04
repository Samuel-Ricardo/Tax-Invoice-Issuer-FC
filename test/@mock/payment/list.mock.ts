import Payment from "../../../src/@modules/domain/entity/payment.entity";

export const PAYMENT_LIST_MOCK = [
  new Payment("p-1", new Date("2026-01-15"), 1500.5),
  new Payment("p-2", new Date("2026-01-20"), 2000.75),
  new Payment("p-3", new Date("2026-02-10"), 1200.0),
];
