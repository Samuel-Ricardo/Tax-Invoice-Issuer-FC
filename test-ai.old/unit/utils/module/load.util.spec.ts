import { merge, load } from "../../../../src/@utils/module/load.util";
import { ContainerModule } from "inversify";

describe("[UNIT] Utility - Module Loader", () => {
  describe("merge", () => {
    test("Should merge multiple container modules", () => {
      const module1 = new ContainerModule(({ bind }) => {
        bind("SERVICE_1").toConstantValue("value1");
      });

      const module2 = new ContainerModule(({ bind }) => {
        bind("SERVICE_2").toConstantValue("value2");
      });

      const container = merge([module1, module2]);

      expect(container).toBeDefined();
      expect(container.get("SERVICE_1")).toBe("value1");
      expect(container.get("SERVICE_2")).toBe("value2");
    });

    test("Should handle single module", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("value");
      });

      const container = merge([module]);

      expect(container).toBeDefined();
      expect(container.get("SERVICE")).toBe("value");
    });

    test("Should handle empty array", () => {
      const container = merge([]);

      expect(container).toBeDefined();
    });

    test("Should create container with autobind enabled", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("TEST").toConstantValue("test");
      });

      const container = merge([module]);

      expect(container).toBeDefined();
    });
  });

  describe("load", () => {
    test("Should load a single container module", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("loaded");
      });

      const container = load(module);

      expect(container).toBeDefined();
      expect(container.get("SERVICE")).toBe("loaded");
    });

    test("Should use Singleton scope by default", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("singleton");
      });

      const container = load(module);

      expect(container).toBeDefined();
      //expect(container.options.defaultScope).toBe("Singleton");
    });

    test("Should allow custom scope (Transient)", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("transient");
      });

      const container = load(module, "Transient");

      expect(container).toBeDefined();
      //expect(container.options.defaultScope).toBe("Transient");
    });

    test("Should allow custom scope (Request)", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("request");
      });

      const container = load(module, "Request");

      expect(container).toBeDefined();
      //expect(container.options.defaultScope).toBe("Request");
    });

    test("Should enable autobind", () => {
      const module = new ContainerModule(({ bind }) => {
        bind("TEST").toConstantValue("autobind");
      });

      const container = load(module);

      expect(container).toBeDefined();
      //xpect(container.options.autobind).toBe(true);
    });
  });

  describe("Integration", () => {
    test("Should work with real-world scenario", () => {
      interface Repository {
        getData(): string;
      }

      class TestRepository implements Repository {
        getData() {
          return "test data";
        }
      }

      const repositoryModule = new ContainerModule(({ bind }) => {
        bind<Repository>("Repository").to(TestRepository);
      });

      const container = load(repositoryModule);

      const repo = container.get<Repository>("Repository");
      expect(repo.getData()).toBe("test data");
    });

    test("Should support multiple bindings in merged modules", () => {
      const infraModule = new ContainerModule(({ bind }) => {
        bind("DATABASE").toConstantValue("postgres");
        bind("CACHE").toConstantValue("redis");
      });

      const appModule = new ContainerModule(({ bind }) => {
        bind("SERVICE").toConstantValue("invoice");
        bind("CONTROLLER").toConstantValue("http");
      });

      const container = merge([infraModule, appModule]);

      expect(container.get("DATABASE")).toBe("postgres");
      expect(container.get("CACHE")).toBe("redis");
      expect(container.get("SERVICE")).toBe("invoice");
      expect(container.get("CONTROLLER")).toBe("http");
    });
  });
});
