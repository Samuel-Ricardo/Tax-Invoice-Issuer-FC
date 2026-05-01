export const TEST_CONFIG_REGISTRY = {
  EVENT: {
    S: Symbol.for("MODULE:INFRA:CONFIG:EVENTS"),
    INVOICE: {
      GENERATED: Symbol.for("MODULE:INFRA:CONFIG:EVENTS:INVOICE:GENERATED"),
    },
  },

  ENV: {
    IRONMENT: Symbol.for("MODULE:INFRA:CONFIG:ENV"),
    DATABASE: {
      URL: Symbol.for("MODULE:INFRA:CONFIG:ENV:DATABASE:URL"),
    },
  },
};
