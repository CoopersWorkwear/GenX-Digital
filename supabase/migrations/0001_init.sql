-- GenX Digital — initial schema
-- Customers, carts, orders, and a pricing-override table for retail markup.
-- Applied via the Supabase MCP/CLI once the project is created.

-- Pricing overrides: per-TLD or per-product markup. Falls back to the
-- DEFAULT_MARKUP_PERCENT env var when no row matches.
create table if not exists pricing_overrides (
  id            uuid primary key default gen_random_uuid(),
  -- e.g. "tld:com.au" or "product:<dreamscape_plan_id>"
  key           text not null unique,
  markup_percent numeric(6,2) not null check (markup_percent >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Orders placed by customers. Each order may provision one or more items via
-- Dreamscape after payment succeeds.
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  -- Supabase auth user id (nullable until accounts phase lands).
  user_id       uuid,
  email         text not null,
  status        text not null default 'pending'
                  check (status in ('pending','paid','provisioning','completed','failed','cancelled')),
  currency      text not null default 'AUD',
  subtotal      numeric(12,2) not null default 0,
  tax           numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  -- Payment + provisioning references, filled in later phases.
  payment_ref   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  -- 'domain' | 'hosting' | 'ssl' | 'email' | 'website_build'
  product_type  text not null,
  -- domain name, or Dreamscape plan id
  product_ref   text not null,
  description   text,
  cost_price    numeric(12,2),
  unit_price    numeric(12,2) not null,
  quantity      int not null default 1 check (quantity > 0),
  -- Dreamscape order/service id once provisioned.
  provider_ref  text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_email on orders(email);
create index if not exists idx_order_items_order on order_items(order_id);

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();
create trigger trg_pricing_updated before update on pricing_overrides
  for each row execute function set_updated_at();
