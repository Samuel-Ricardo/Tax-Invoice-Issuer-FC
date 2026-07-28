import { SecretError } from "../../../../../src/@lib/error/secret.error";

function requiredSecret(secretName: string): string {
  const secret = process.env[secretName]?.trim();

  if (!secret) {
    throw new SecretError(`${secretName} is required`);
  }

  return secret;
}

export const TEST_ENV = {
  ...process.env,
  DATABASE: {
    URL: requiredSecret("DATABASE_URL"),
  },
};
