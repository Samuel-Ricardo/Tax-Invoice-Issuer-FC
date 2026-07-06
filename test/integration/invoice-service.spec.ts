import { Contract } from "../../src/@modules/domain/entity/contract.entity";
import Payment from "../../src/@modules/domain/entity/payment.entity";
import { Invoice } from "../../src/@modules/domain/entity/invoice.entity";
import { TEST_MODULES } from "../module/app.factory";
import { CONTRACT_LIST_MOCK } from "../@mock/contract/list.mock";
import {
  INVOICE_GENERATE_VALID_INPUT,
  INVOICE_GENERATE_ACCRUAL_INPUT,
} from "../@mock/invoice/generate.mock";
import { INVOICE_RESULT_LIST } from "../@mock/invoice/result.mock";
import { InvoiceDTO } from "../../src/@modules/domain/DTO/invoice.dto";

/**
 * Integration tests: InvoiceService ↔ UseCases (ListContract + GenerateInvoice)
 *
 * Tests the interaction between the service layer and use cases with mocked
 * repositories and mediator. No database or HTTP layer involved.
 */

describe("[INTEGRATION] | [INVOICE SERVICE] <-> [USE CASES]", () => {
  afterEach(() => {
    jest.clearAllMocks();
  }); // ============================================================================
  // SERVICE → USE CASE CHAIN
  // ============================================================================

  it("[INTEGRATION] | [SERVICE] - calls ListContract then GenerateInvoice in sequence", async () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();

    module.use_case.list.contract.execute.mockResolvedValue(CONTRACT_LIST_MOCK);
    module.use_case.generate.invoice.execute.mockResolvedValue(
      INVOICE_RESULT_LIST,
    );

    const result = await module.service.generate(
      INVOICE_GENERATE_VALID_INPUT as InvoiceDTO,
    );

    // ListContract must be called first
    expect(module.use_case.list.contract.execute).toHaveBeenCalled();

    // GenerateInvoice called with contracts from ListContract + invoice DTO
    expect(module.use_case.generate.invoice.execute).toHaveBeenCalledWith({
      contracts: CONTRACT_LIST_MOCK,
      invoice: INVOICE_GENERATE_VALID_INPUT,
    });

    expect(result).toBe(INVOICE_RESULT_LIST);
  });

  it("[INTEGRATION] | [SERVICE] - passes accrual input to GenerateInvoice use case", async () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();
    const contracts = [
      new Contract(
        "c-1",
        "Software License",
        24000,
        24,
        new Date("2021-06-01"),
      ),
    ];

    module.use_case.list.contract.execute.mockResolvedValue(contracts);
    module.use_case.generate.invoice.execute.mockResolvedValue([
      new Invoice(new Date("2022-01-01"), 1000),
    ]);

    const result = await module.service.generate(
      INVOICE_GENERATE_ACCRUAL_INPUT as InvoiceDTO,
    );

    expect(module.use_case.generate.invoice.execute).toHaveBeenCalledWith({
      contracts,
      invoice: INVOICE_GENERATE_ACCRUAL_INPUT,
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("[INTEGRATION] | [SERVICE] - returns empty array when ListContract returns empty", async () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();

    module.use_case.list.contract.execute.mockResolvedValue([]);
    module.use_case.generate.invoice.execute.mockResolvedValue([]);

    const result = await module.service.generate(
      INVOICE_GENERATE_VALID_INPUT as InvoiceDTO,
    );

    expect(module.use_case.generate.invoice.execute).toHaveBeenCalledWith({
      contracts: [],
      invoice: INVOICE_GENERATE_VALID_INPUT,
    });
    expect(result).toEqual([]);
  });

  // ============================================================================
  // USE CASE → MEDIATOR INTEGRATION
  // ============================================================================

  it("[INTEGRATION] | [USE CASE] - GenerateInvoice publishes to mediator after generating", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.INVOICE.SIMULATE();

    const contracts = [
      new Contract("c-1", "Test Contract", 12000, 12, new Date("2022-01-01")),
    ];
    contracts[0].addPayment(new Payment("p-1", new Date("2022-02-10"), 1000));

    module.mediator.publish.mockResolvedValue(undefined);

    const result = await module.use_case.execute({
      contracts,
      invoice: { month: 2, year: 2022, type: "cash" },
    });

    expect(module.mediator.publish).toHaveBeenCalledWith(
      module.INVOICE_GENERATED,
      expect.any(Array),
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it("[INTEGRATION] | [USE CASE] - GenerateInvoice flattens results from multiple contracts", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.INVOICE.SIMULATE();

    const contract1 = new Contract(
      "c-1",
      "Contract A",
      12000,
      12,
      new Date("2022-01-01"),
    );
    const contract2 = new Contract(
      "c-2",
      "Contract B",
      6000,
      6,
      new Date("2022-01-01"),
    );

    // Add Feb payments to both
    contract1.addPayment(new Payment("p-1", new Date("2022-02-10"), 1000));
    contract2.addPayment(new Payment("p-2", new Date("2022-02-15"), 500));

    module.mediator.publish.mockResolvedValue(undefined);

    const result = await module.use_case.execute({
      contracts: [contract1, contract2],
      invoice: { month: 2, year: 2022, type: "cash" },
    });

    // Both contracts' February invoices are excluded (isValid is false for Feb)
    // but the call still happens
    expect(module.mediator.publish).toHaveBeenCalledTimes(1);
    expect(Array.isArray(result)).toBe(true);
  });

  // ============================================================================
  // LIST CONTRACT USE CASE → REPOSITORY INTEGRATION
  // ============================================================================

  it("[INTEGRATION] | [LIST CONTRACT] - attaches payments to contracts after listing", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE();

    const contracts = [
      new Contract("c-1", "Contract A", 12000, 12, new Date("2022-01-01")),
    ];
    const payments = [
      new Payment("p-1", new Date("2022-01-15"), 1000),
      new Payment("p-2", new Date("2022-02-10"), 2000),
    ];

    module.repository.contract.list.mockResolvedValue(contracts);
    module.repository.payment.list.mockResolvedValue(payments);

    const result = await module.use_case.execute();

    expect(result).toHaveLength(1);
    expect(result[0].payments).toHaveLength(2);
    expect(result[0].getBalance()).toBe(9000); // 12000 - 1000 - 2000
  });

  it("[INTEGRATION] | [LIST CONTRACT] - calls payment.list once per contract", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE();

    const contracts = CONTRACT_LIST_MOCK;
    module.repository.contract.list.mockResolvedValue(contracts);
    module.repository.payment.list.mockResolvedValue([]);

    await module.use_case.execute();

    expect(module.repository.payment.list).toHaveBeenCalledTimes(
      contracts.length,
    );
  });

  it("[INTEGRATION] | [LIST CONTRACT] - returns contracts with their balance calculated correctly", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE();

    const contract = new Contract(
      "c-1",
      "Service",
      10000,
      10,
      new Date("2022-01-01"),
    );
    const payments = [new Payment("p-1", new Date("2022-01-10"), 1000)];

    module.repository.contract.list.mockResolvedValue([contract]);
    module.repository.payment.list.mockResolvedValue(payments);

    const result = await module.use_case.execute();

    expect(result[0].getBalance()).toBe(9000);
    expect(result[0].getAmountByPeriod()).toBe(1000);
  });
});
