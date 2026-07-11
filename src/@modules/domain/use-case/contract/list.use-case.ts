import { Contract } from "../../entity/contract.entity";

export interface ListContractUseCase {
  execute(): Promise<Contract[]>;
}
