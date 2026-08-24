-- Additive baseline for production deployments.
-- The destructive migration/create.sql is intentionally not used here.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS sam;

CREATE TABLE IF NOT EXISTS sam.contract (
  id_contract uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text,
  amount numeric,
  periods integer,
  date timestamp
);

CREATE TABLE IF NOT EXISTS sam.payment (
  id_payment uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  id_contract uuid REFERENCES sam.contract(id_contract),
  amount numeric,
  date timestamp
);
