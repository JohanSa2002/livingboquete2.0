-- One catalogue for everything on the map: monthly rentals, houses for sale
-- and land. Same JSON-document shape as the other content tables (so the
-- generic admin CRUD and public read keep working unchanged), plus `kind`
-- promoted to a real column: derived from the document itself so it can never
-- drift from it, constrained to the three known kinds, and indexed because
-- the explorer filters on it constantly.
create table if not exists listings (
  id text primary key,
  data jsonb not null,
  kind text generated always as (data->>'kind') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_kind_check check (kind in ('rent', 'sale', 'land'))
);

create index if not exists listings_kind_created_at_idx on listings (kind, created_at);
create index if not exists listings_created_at_idx on listings (created_at);

-- Same access model as 0001: RLS on with no policies, so only the server-side
-- service_role key can read or write.
alter table listings enable row level security;
