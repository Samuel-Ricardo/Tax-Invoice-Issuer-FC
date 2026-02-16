export const USE_CASE_REGISTRY = {
  INVOICE: {
    GENERATE: Symbol.for("MODULE:APP:USE-CASE:INVOICE"),
  },
  CONTRACT: {
    LIST: Symbol.for("MODULE:APP:USE-CASE:CONTRACT"),
  },
  EMAIL: {
    SEND: {
      INVOICE: Symbol.for("MODULE:APP:USE-CASE:EMAIL:SEND:INVOICE"),
    },
  },
};
