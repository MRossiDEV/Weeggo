-- =============================================================================
-- WEEGGO partners: location fields
--
-- Adds country/city/address to weeggo_partners — informational only (where
-- the partner agency itself is based), not a filter/matching dimension like
-- weeggo_properties' country/department/locality/city, so these stay plain
-- free text rather than reusing the constrained NEIGHBORHOODS/CITIES lists.
--
-- Run via `supabase db push`, `supabase migration up`, or paste into the
-- Supabase SQL editor.
-- =============================================================================

alter table weeggo_partners
  add column if not exists country text default 'Uruguay',
  add column if not exists city text,
  add column if not exists address text;

comment on column weeggo_partners.country is 'Where the partner agency is based — informational, not a filter dimension.';
comment on column weeggo_partners.city is 'Where the partner agency is based — informational, not a filter dimension.';
comment on column weeggo_partners.address is 'Partner agency''s street address — informational only.';
