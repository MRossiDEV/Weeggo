-- =============================================================================
-- WEEGGO retention & re-engagement — notification infrastructure (Phase 1)
--
-- Adds the tables needed for saved-search alerts: a lightweight "visitor"
-- identity (no login — a random id the client generates and persists in
-- localStorage, the same trust model as a share/capability token), the
-- searches they've saved, their push subscriptions, and a log of every
-- notification sent (used for the /notifications feed, frequency capping,
-- and future opt-out metrics).
--
-- Like weeggo_email_templates/weeggo_email_log, none of these tables get an
-- anon/authenticated RLS policy — there's no auth binding a visitor_id to a
-- verified identity, so client access only ever goes through server actions
-- using the service-role client (supabaseAdmin), which bypasses RLS. RLS is
-- still enabled so a future direct-from-browser Supabase call fails closed
-- instead of silently working.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- weeggo_visitors
-- One row per anonymous visitor id (see lib/notifications/visitor.ts). Holds
-- their notification channel/category preferences and, once they save a
-- search with an email, their email address.
-- -----------------------------------------------------------------------------

create table weeggo_visitors (
  id                uuid primary key default gen_random_uuid(),
  email             text,
  push_enabled      boolean not null default true,
  email_enabled     boolean not null default true,
  -- Per-category opt-in, e.g. {"new_match": {"push": true, "email": true}, ...}.
  -- Checked in addition to push_enabled/email_enabled above, per PRD section 7
  -- ("opt out per category ... rather than all-or-nothing").
  categories        jsonb not null default '{
    "new_match": {"push": true, "email": true},
    "price_drop": {"push": true, "email": true},
    "digest": {"push": false, "email": true}
  }'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table weeggo_visitors is 'Anonymous visitor identity (client-generated id, no login) for saved-search alerts and push subscriptions.';

create trigger weeggo_visitors_set_updated_at
  before update on weeggo_visitors
  for each row execute function weeggo_set_updated_at();


-- -----------------------------------------------------------------------------
-- weeggo_saved_searches
-- -----------------------------------------------------------------------------

create table weeggo_saved_searches (
  id                uuid primary key default gen_random_uuid(),
  visitor_id        uuid not null references weeggo_visitors (id) on delete cascade,
  mode              text not null check (mode in ('buy', 'rent', 'invest')),
  -- Serialized lib/discover/types.ts Filters — kept as opaque jsonb rather
  -- than exploded into columns since it's read back by the same
  -- passesFilters() the deck itself uses, not queried on directly.
  filters           jsonb not null,
  label             text not null,
  active            boolean not null default true,
  last_matched_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table weeggo_saved_searches is 'A visitor''s saved filter set (PRD 6.1) — matched against newly published listings to trigger alerts.';

create index weeggo_saved_searches_visitor_id_idx on weeggo_saved_searches (visitor_id);
create index weeggo_saved_searches_active_idx on weeggo_saved_searches (active) where active = true;

create trigger weeggo_saved_searches_set_updated_at
  before update on weeggo_saved_searches
  for each row execute function weeggo_set_updated_at();


-- -----------------------------------------------------------------------------
-- weeggo_push_subscriptions
-- Web Push subscriptions (installable-PWA push, not a native mobile push
-- token) — one row per browser/device a visitor has enabled push on.
-- -----------------------------------------------------------------------------

create table weeggo_push_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  visitor_id        uuid not null references weeggo_visitors (id) on delete cascade,
  endpoint          text not null unique,
  p256dh            text not null,
  auth              text not null,
  user_agent        text,
  created_at        timestamptz not null default now()
);

comment on table weeggo_push_subscriptions is 'Web Push subscriptions (PushManager endpoint + keys) per visitor device.';

create index weeggo_push_subscriptions_visitor_id_idx on weeggo_push_subscriptions (visitor_id);


-- -----------------------------------------------------------------------------
-- weeggo_notifications
-- Log of every notification attempt — doubles as the /notifications feed
-- and the source of truth for frequency capping (count recent rows per
-- visitor+category) and future opt-out/open-rate metrics.
-- -----------------------------------------------------------------------------

create table weeggo_notifications (
  id                uuid primary key default gen_random_uuid(),
  visitor_id        uuid not null references weeggo_visitors (id) on delete cascade,
  category          text not null check (category in ('new_match', 'price_drop', 'status_change', 'digest')),
  channel           text not null check (channel in ('push', 'email')),
  title             text not null,
  body              text not null,
  saved_search_id   uuid references weeggo_saved_searches (id) on delete set null,
  listing_ids       uuid[] not null default '{}',
  status            text not null default 'sent' check (status in ('sent', 'failed', 'skipped_quiet_hours', 'skipped_cap')),
  read_at           timestamptz,
  created_at        timestamptz not null default now()
);

comment on table weeggo_notifications is 'Log of every notification attempt (sent or skipped), per channel. Feeds /notifications and frequency-cap checks.';

create index weeggo_notifications_visitor_id_idx on weeggo_notifications (visitor_id, created_at desc);
create index weeggo_notifications_visitor_category_idx on weeggo_notifications (visitor_id, category, created_at desc);


-- =============================================================================
-- Row Level Security — deny all direct client access (service-role only).
-- =============================================================================

alter table weeggo_visitors enable row level security;
alter table weeggo_saved_searches enable row level security;
alter table weeggo_push_subscriptions enable row level security;
alter table weeggo_notifications enable row level security;
