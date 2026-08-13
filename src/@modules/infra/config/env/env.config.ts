import { SecretError } from "../../../../@lib/error/secret.error";

function requiredSecret(secretName: string): string {
  const secret = process.env[secretName]?.trim();

  if (!secret) {
    throw new SecretError(`${secretName} is required`);
  }

  return secret;
}

export const ENV = {
  ...process.env,
  DATABASE: {
    URL: requiredSecret("DATABASE_URL"),
  },
};
