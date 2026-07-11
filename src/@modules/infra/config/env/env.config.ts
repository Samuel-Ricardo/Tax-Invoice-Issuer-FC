export const ENV = {
  ...process.env,
  DATABASE: {
    URL:
      process.env.DATABASE_URL ||
      "postgresql://postgres:123456@localhost:5432/postgres",
  },
};
