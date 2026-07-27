-- =============================================================================
-- WEEGGO wizard questions — admin-editable assistant content
--
-- Replaces the hardcoded `question`-type steps in app/wizard/data/
-- buyerAssessment.ts and sellerOnboarding.ts with DB-backed rows the admin
-- section can CRUD (add/remove questions, add/remove their options, reorder,
-- draft/publish) to test and tune the assistant without a code deploy.
--
-- The `intro`/`summary`/`processing`/`completion` steps of each flow stay
-- hardcoded in those two files — only the actual questions (and their
-- options) move here. Spanish only for now; English keeps using the
-- existing static lib/i18n/wizard-content.ts overrides, unaffected by this.
-- =============================================================================

create type weeggo_wizard_flow as enum ('buyer', 'seller');

create type weeggo_wizard_question_type as enum (
  'single', 'multiple', 'text', 'email', 'phone', 'number', 'range', 'select', 'location', 'currency'
);

create type weeggo_wizard_question_category as enum (
  'profile', 'contact', 'situation', 'property', 'lifestyle', 'location', 'financial', 'timeline', 'additional'
);

create type weeggo_wizard_condition_operator as enum (
  'equals', 'not_equals', 'contains', 'greater_than', 'less_than'
);

create type weeggo_wizard_question_status as enum ('draft', 'published');


-- -----------------------------------------------------------------------------
-- weeggo_wizard_questions
-- -----------------------------------------------------------------------------

create table weeggo_wizard_questions (
  id                  uuid primary key default gen_random_uuid(),
  flow                weeggo_wizard_flow not null,
  -- Stable identifier the rest of the app reads by (lib/wizard/answers-to-
  -- filters.ts, seller-answers-to-lead.ts, Wizard.tsx's "intent"==="sell"
  -- branch, and this same question's own condition_step_key/other
  -- questions' conditions) — deleting a question the app depends on just
  -- means that filter/lead field comes back empty, never a crash, but
  -- renaming step_key on an existing question silently breaks whichever
  -- code path reads that literal string.
  step_key            text not null,
  title               text not null,
  subtitle            text,
  placeholder         text,
  category            weeggo_wizard_question_category not null default 'additional',
  question_type       weeggo_wizard_question_type not null default 'single',
  required            boolean not null default true,
  -- Conditional display, e.g. "only show budget_rent if intent = rent" —
  -- condition_step_key references another question's step_key within the
  -- same flow (enforced in application code, not a DB FK, since step_key
  -- isn't unique on its own — only (flow, step_key) is).
  condition_step_key  text,
  condition_operator  weeggo_wizard_condition_operator,
  condition_value     text,
  sort_order          integer not null default 0,
  status              weeggo_wizard_question_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (flow, step_key)
);

comment on table weeggo_wizard_questions is 'Admin-editable questions for the buyer/seller wizard assistants — see app/wizard/lib/load-questions.ts.';

create index weeggo_wizard_questions_flow_idx on weeggo_wizard_questions (flow, sort_order);
create index weeggo_wizard_questions_flow_status_idx on weeggo_wizard_questions (flow, status);

create trigger weeggo_wizard_questions_set_updated_at
  before update on weeggo_wizard_questions
  for each row execute function weeggo_set_updated_at();


-- -----------------------------------------------------------------------------
-- weeggo_wizard_options
-- -----------------------------------------------------------------------------

create table weeggo_wizard_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references weeggo_wizard_questions (id) on delete cascade,
  -- The value scoring/filter-mapping logic actually reads. For questions
  -- whose answer feeds a numeric filter (budget/yield), this IS the raw
  -- number as text (e.g. "300000"), not a symbolic bucket key — so adding a
  -- new bracket is just adding a row, no code lookup table involved.
  value         text not null,
  label         text not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table weeggo_wizard_options is 'Answer choices for a weeggo_wizard_questions row (single/multiple/select question types).';

create index weeggo_wizard_options_question_id_idx on weeggo_wizard_options (question_id, sort_order);

create trigger weeggo_wizard_options_set_updated_at
  before update on weeggo_wizard_options
  for each row execute function weeggo_set_updated_at();


-- =============================================================================
-- Row Level Security
-- Public (anon) can read published questions/options only — same pattern as
-- weeggo_properties_public_select. Admin CRUD goes through the service-role
-- client (supabaseAdmin), which bypasses RLS.
-- =============================================================================

alter table weeggo_wizard_questions enable row level security;
alter table weeggo_wizard_options enable row level security;

create policy weeggo_wizard_questions_public_select
  on weeggo_wizard_questions for select
  to anon, authenticated
  using (status = 'published');

create policy weeggo_wizard_options_public_select
  on weeggo_wizard_options for select
  to anon, authenticated
  using (
    exists (
      select 1 from weeggo_wizard_questions q
      where q.id = weeggo_wizard_options.question_id
        and q.status = 'published'
    )
  );


-- =============================================================================
-- Seed: the existing hardcoded buyer-assessment + seller-onboarding
-- questions, migrated verbatim (all published — this is already-live copy).
--
-- Exception: budget_purchase's options used to be symbolic bucket keys
-- ("300k", "600k", ...) resolved through a hardcoded lookup table in
-- answers-to-filters.ts. That table is removed as part of this change —
-- budget_purchase now works exactly like budget_rent/target_yield/bedrooms
-- already did, with the option's own `value` being the literal number.
-- =============================================================================

do $$
declare
  q_id uuid;
begin

  -- ============================= buyer flow =================================

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'intent', '¿Qué estás buscando?', 'profile', 'single', true, 0, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'buy', 'Quiero Comprar', 0),
    (q_id, 'rent', 'Busco Alquilar', 1),
    (q_id, 'invest', 'Pienso Invertir', 2),
    (q_id, 'sell', 'Quiero Vender', 3);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'lifestyle', '¿Cómo te gusta vivir?', 'lifestyle', 'multiple', false, 1, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'beach', 'Cerca de la playa', 0),
    (q_id, 'walkable', 'Con vida de barrio, todo cerca', 1),
    (q_id, 'quiet', 'Tranquilo y residencial', 2),
    (q_id, 'family', 'Pensado para la familia', 3),
    (q_id, 'central', 'Central y bien conectado', 4);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'preferred_locations', '¿Qué zonas te interesan?', 'location', 'multiple', true, 2, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'Pocitos', 'Pocitos', 0),
    (q_id, 'Punta Carretas', 'Punta Carretas', 1),
    (q_id, 'Carrasco', 'Carrasco', 2),
    (q_id, 'Ciudad Vieja', 'Ciudad Vieja', 3),
    (q_id, 'Cordón', 'Cordón', 4),
    (q_id, 'Malvín', 'Malvín', 5),
    (q_id, 'Buceo', 'Buceo', 6);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'property_type', '¿Qué tipo de propiedad te interesa?', 'property', 'multiple', false, 3, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'apartment', 'Apartamento', 0),
    (q_id, 'house', 'Casa', 1),
    (q_id, 'ph', 'PH', 2),
    (q_id, 'loft', 'Loft', 3);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'bedrooms', '¿Cuántos dormitorios necesitás?', 'property', 'single', false, 4, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '0', 'No tengo preferencia', 0),
    (q_id, '1', '1 o más', 1),
    (q_id, '2', '2 o más', 2),
    (q_id, '3', '3 o más', 3),
    (q_id, '4', '4 o más', 4);

  insert into weeggo_wizard_questions (
    flow, step_key, title, category, question_type, required, sort_order, status,
    condition_step_key, condition_operator, condition_value
  )
  values (
    'buyer', 'budget_purchase', '¿Cuál es tu presupuesto?', 'financial', 'single', false, 5, 'published',
    'intent', 'not_equals', 'rent'
  )
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '300000', 'Hasta USD 300.000', 0),
    (q_id, '600000', 'USD 300.000 - 600.000', 1),
    (q_id, '1000000', 'USD 600.000 - 1.000.000', 2),
    (q_id, '3000000', 'USD 1.000.000 - 3.000.000', 3),
    (q_id, '5000000', 'Más de USD 3.000.000', 4);

  insert into weeggo_wizard_questions (
    flow, step_key, title, category, question_type, required, sort_order, status,
    condition_step_key, condition_operator, condition_value
  )
  values (
    'buyer', 'budget_rent', '¿Cuál es tu presupuesto mensual?', 'financial', 'single', false, 6, 'published',
    'intent', 'equals', 'rent'
  )
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '800', 'Hasta USD 800', 0),
    (q_id, '1500', 'USD 800 - 1.500', 1),
    (q_id, '2500', 'USD 1.500 - 2.500', 2),
    (q_id, '4000', 'USD 2.500 - 4.000', 3),
    (q_id, '8000', 'Más de USD 4.000', 4);

  insert into weeggo_wizard_questions (
    flow, step_key, title, category, question_type, required, sort_order, status,
    condition_step_key, condition_operator, condition_value
  )
  values (
    'buyer', 'target_yield', '¿Qué rentabilidad mínima buscás?', 'financial', 'single', false, 7, 'published',
    'intent', 'equals', 'invest'
  )
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '0', 'No tengo un mínimo en mente', 0),
    (q_id, '3', '3% o más', 1),
    (q_id, '5', '5% o más', 2),
    (q_id, '7', '7% o más', 3);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'amenities', '¿Qué comodidades te gustaría tener?', 'lifestyle', 'multiple', false, 8, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'Parking', 'Garaje', 0),
    (q_id, 'Balcony', 'Balcón', 1),
    (q_id, 'Pet friendly', 'Acepta mascotas', 2),
    (q_id, 'Elevator', 'Ascensor', 3),
    (q_id, 'Pool', 'Piscina', 4),
    (q_id, 'Doorman', 'Portero', 5),
    (q_id, 'Renovated', 'Renovado', 6);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('buyer', 'parking', '¿Necesitás cochera / garaje?', 'property', 'single', true, 9, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'yes', 'Sí, es imprescindible', 0),
    (q_id, 'preferred', 'Prefiero que tenga, no excluyente', 1),
    (q_id, 'no', 'No la necesito', 2);


  -- ============================= seller flow =================================

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'property_type', '¿Qué tipo de propiedad es?', 'property', 'single', true, 0, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'apartment', 'Apartamento', 0),
    (q_id, 'house', 'Casa', 1),
    (q_id, 'ph', 'PH', 2),
    (q_id, 'loft', 'Loft', 3);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'property_location', '¿En qué zona está ubicada?', 'location', 'single', true, 1, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'Pocitos', 'Pocitos', 0),
    (q_id, 'Punta Carretas', 'Punta Carretas', 1),
    (q_id, 'Carrasco', 'Carrasco', 2),
    (q_id, 'Ciudad Vieja', 'Ciudad Vieja', 3),
    (q_id, 'Cordón', 'Cordón', 4),
    (q_id, 'Malvín', 'Malvín', 5),
    (q_id, 'Buceo', 'Buceo', 6),
    (q_id, 'Otra', 'Otra zona', 7);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'bedrooms', '¿Cuántos dormitorios tiene?', 'property', 'single', true, 2, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '0', 'Monoambiente', 0),
    (q_id, '1', '1', 1),
    (q_id, '2', '2', 2),
    (q_id, '3', '3', 3),
    (q_id, '4', '4 o más', 4);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'bathrooms', '¿Cuántos baños tiene?', 'property', 'single', true, 3, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, '1', '1', 0),
    (q_id, '2', '2', 1),
    (q_id, '3', '3 o más', 2);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, placeholder, sort_order, status)
  values ('seller', 'area_m2', '¿Cuántos m² tiene la propiedad?', 'property', 'number', true, 'Superficie en m²', 4, 'published');

  insert into weeggo_wizard_questions (flow, step_key, title, subtitle, category, question_type, required, placeholder, sort_order, status)
  values (
    'seller', 'asking_price', '¿Cuánto esperás obtener por la propiedad?',
    'En dólares (USD). Si no estás seguro, poné un valor estimado.',
    'financial', 'number', true, 'Precio estimado en USD', 5, 'published'
  );

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'amenities', '¿Qué características tiene?', 'lifestyle', 'multiple', false, 6, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'Parking', 'Garaje', 0),
    (q_id, 'Balcony', 'Balcón', 1),
    (q_id, 'Pet friendly', 'Acepta mascotas', 2),
    (q_id, 'Elevator', 'Ascensor', 3),
    (q_id, 'Pool', 'Piscina', 4),
    (q_id, 'Doorman', 'Portero', 5),
    (q_id, 'Renovated', 'Renovado', 6);

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, placeholder, sort_order, status)
  values (
    'seller', 'property_notes', 'Contanos más sobre la propiedad', 'additional', 'text', false,
    'Estado, antigüedad, algo que la haga especial...', 7, 'published'
  );

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, placeholder, sort_order, status)
  values ('seller', 'full_name', '¿Cuál es tu nombre completo?', 'contact', 'text', true, 'Nombre y apellido', 8, 'published');

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, placeholder, sort_order, status)
  values ('seller', 'email', '¿Cuál es tu email?', 'contact', 'email', true, 'tu@email.com', 9, 'published');

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, placeholder, sort_order, status)
  values ('seller', 'phone', '¿Cuál es tu teléfono?', 'contact', 'phone', true, '+598 99 123 456', 10, 'published');

  insert into weeggo_wizard_questions (flow, step_key, title, category, question_type, required, sort_order, status)
  values ('seller', 'contact_method', '¿Cómo preferís que te contactemos?', 'contact', 'single', true, 11, 'published')
  returning id into q_id;
  insert into weeggo_wizard_options (question_id, value, label, sort_order) values
    (q_id, 'WhatsApp', 'WhatsApp', 0),
    (q_id, 'Email', 'Email', 1),
    (q_id, 'Llamada', 'Llamada', 2);

end $$;
