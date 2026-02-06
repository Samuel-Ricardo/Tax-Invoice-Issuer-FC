export const ENV = {
  ...process.env,
  DATABASE: {
    URL: process.env.DATABASE_URL,
  },
};
