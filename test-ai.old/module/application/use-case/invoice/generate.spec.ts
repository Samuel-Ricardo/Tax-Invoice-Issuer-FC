import { GenerateInvoiceUseCaseImpl } from "../../../../../src/@modules/application/use-case/invoice/generate.use-case";
import { MockMediator } from "../../../../helpers/mediator.helper";
import { TestFixtures } from "../../../../helpers/fixtures";

describe("[USE-CASE] INVOICE - GENERATE", () => {
  let useCase: GenerateInvoiceUseCaseImpl;
  let mockMediator: MockMediator;
  const INVOICE_GENERATED_EVENT = "INVOICE_GENERATED";

  beforeEach(() => {
    mockMediator = new MockMediator();
    useCase = new GenerateInvoiceUseCaseImpl(
      mockMediator,
      INVOICE_GENERATED_EVENT,
    );
  });

  afterEach(() => {
    mockMediator.reset();
  });

  test("Should generate invoice", async () => {
    const contract = TestFixtures.createContract();
    const invoiceDTO = {
      month: 1,
      year: 2022,
      type: "accrual" as const,
    };

    const result = await useCase.execute({
      contracts: [contract],
      invoice: invoiceDTO,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("Should publish event after generation", async () => {
    const contract = TestFixtures.createContract();
    const invoiceDTO = {
      month: 1,
      year: 2022,
      type: "accrual" as const,
    };

    await useCase.execute({
      contracts: [contract],
      invoice: invoiceDTO,
    });

    const events = mockMediator.getPublishedEvents(INVOICE_GENERATED_EVENT);
    expect(events).toHaveLength(1);
  });
});
