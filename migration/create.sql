drop schema sam cascade;

create schema sam;

create table sam.contract (
  id_contract uuid not null default uuid_generate_v4() primary key,
  description text, 
  amount numeric,
  periods integer,
  date timestamp
);

create table sam.payment (
  id_payment uuid not null default uuid_generate_v4() primary key,
  id_contract uuid references sam.contract(id_contract),
  amount numeric,
  date timestamp
);


