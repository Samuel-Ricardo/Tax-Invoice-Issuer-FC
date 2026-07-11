import { Contract } from "../entity/contract.entity";

export interface ContractRepository {
  list(): Promise<Contract[]>;
}
