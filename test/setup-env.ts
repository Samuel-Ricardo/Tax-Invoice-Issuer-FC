const databaseUrl = process.env.DATABASE_URL?.trim();

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}
