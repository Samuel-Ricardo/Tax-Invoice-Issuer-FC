import { load } from "../../../../src/@utils/module/load.util";
import { MOCK_PRESENTER_MODULE } from "./presenter.module";
import { MOCK_PRESENTER_REGISTRY } from "./presenter.registry";

const _MODULE = load(MOCK_PRESENTER_MODULE);

export const MOCK_PRESENTER_FACTORY = {
  CSV: {
    NATIVE: () => _MODULE.get(MOCK_PRESENTER_REGISTRY.CSV.NATIVE),
  },
};
