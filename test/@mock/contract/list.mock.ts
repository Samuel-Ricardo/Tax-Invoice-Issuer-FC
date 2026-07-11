import { Contract } from "../../../src/@modules/domain/entity/contract.entity";

export const CONTRACT_LIST_MOCK = [
  new Contract("c-1", "Contrato A", 12000, 12, new Date("2026-01-01")),
  new Contract("c-2", "Contrato B", 6000, 6, new Date("2026-02-01")),
];
