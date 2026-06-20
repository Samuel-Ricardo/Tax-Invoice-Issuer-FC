import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { InvoiceController } from "../../../../../src/@modules/application/controller/invoice/invoice.controller";
import { ResolutionContext } from "inversify";
import { HttpServer } from "../../../../../src/@modules/infra/server/http/http.server";
import { TEST_MODULE } from "../../../app.registry";
import { InvoiceService } from "../../../../../src/@modules/domain/service/invoice/invoice.service";
import { Presenter } from "../../../../../src/@modules/infra/presenter/presenter.interface";
import { Specification } from "../../../../../src/@modules/domain/specification/specification.interface";
import { InvoiceDTO } from "../../../../../src/@modules/domain/DTO/invoice.dto";

export const mockInvoiceController = mockDeep<InvoiceController>();

export const simulateInvoiceController = (module: ResolutionContext) => {
  const server = module.get<DeepMockProxy<HttpServer>>(
    TEST_MODULE.INFRA.SERVER.HTTP.EXPRESS.MOCK,
  );

  const presenter = module.get<DeepMockProxy<Presenter>>(
    TEST_MODULE.INFRA.PRESENTER.JSON.NATIVE,
  );

  const service = module.get<DeepMockProxy<InvoiceService>>(
    TEST_MODULE.APPLICATION.SERVICE.INVOICE.MOCK,
  );

  const specification = module.get<DeepMockProxy<Specification<InvoiceDTO>>>(
    TEST_MODULE.APPLICATION.SPECIFICATION.ZOD.INVOICE.MOCK,
  );

  const controller = new InvoiceController(
    server,
    presenter,
    service,
    specification,
  );

  return { controller, server, presenter, service, specification };
};
