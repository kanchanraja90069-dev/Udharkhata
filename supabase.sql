-- Run once in Supabase: SQL Editor -> New query -> Run
create table if not exists entries (
  id bigint generated always as identity primary key,
  shop text not null,
  customer text not null,
  type text not null check (type in ('udhaar','jama')),
  amount numeric(12,2) not null check (amount > 0),
  item text default '',
  created_at timestamptz not null default now()
);
create index if not exists entries_shop_idx on entries (shop, created_at desc);
alter table entries enable row level security; -- no public policies: only our server (service key) can read/write
