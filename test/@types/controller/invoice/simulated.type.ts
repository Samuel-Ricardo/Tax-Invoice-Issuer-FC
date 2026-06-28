import { DeepMockProxy } from "jest-mock-extended";
import { InvoiceController } from "../../../../src/@modules/application/controller/invoice/invoice.controller";
import { InvoiceService } from "../../../../src/@modules/domain/service/invoice/invoice.service";
import { HttpServer } from "../../../../src/@modules/infra/server/http/http.server";
import { Specification } from "../../../../src/@modules/domain/specification/specification.interface";
import { InvoiceDTO } from "../../../../src/@modules/domain/DTO/invoice.dto";
import { Presenter } from "../../../../src/@modules/infra/presenter/presenter.interface";

export interface SimulatedInvoiceController {
  controller: InvoiceController;
  server: DeepMockProxy<HttpServer>;
  presenter: DeepMockProxy<Presenter>;
  service: DeepMockProxy<InvoiceService>;
  specification: DeepMockProxy<Specification<InvoiceDTO>>;
}
