-- GenX Digital — customer account environment
-- Active services (domains, hosting, SSL, email) with per-service auto-renew,
-- plus domain transfer-in requests. Services are derived from paid orders and
-- kept in sync; provisioning will later populate provider_ref / expires_at from
-- Dreamscape.

create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  email         text not null,
  -- 'domain' | 'hosting' | 'ssl' | 'email' | 'website_build'
  type          text not null,
  -- human label: the domain name, plan name, etc.
  name          text not null,
  status        text not null default 'active'
                  check (status in ('active','pending','expired','cancelled')),
  auto_renew    boolean not null default true,
  -- the order/order_item this service came from (idempotent sync key)
  order_id      uuid,
  order_item_id uuid unique,
  -- Dreamscape service id once provisioned.
  provider_ref  text,
  registered_at timestamptz not null default now(),
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_services_user on services(user_id);
create index if not exists idx_services_email on services(email);

-- Domain transfer-in requests submitted from the account area. Picked up by an
-- admin (or, later, automated against the Dreamscape transfer API).
create table if not exists transfer_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  email         text not null,
  domain        text not null,
  auth_code     text,
  status        text not null default 'received'
                  check (status in ('received','in_progress','completed','rejected')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_transfer_user on transfer_requests(user_id);
create index if not exists idx_transfer_email on transfer_requests(email);

create trigger trg_services_updated before update on services
  for each row execute function set_updated_at();
create trigger trg_transfer_updated before update on transfer_requests
  for each row execute function set_updated_at();
