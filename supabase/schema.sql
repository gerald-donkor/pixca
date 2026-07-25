-- PIXCA core schema (AGENTS.md section 7)
--
-- Hand-authored, imperative SQL. No Supabase CLI / MCP is available in this
-- project, so this file is applied by hand via Supabase Dashboard -> SQL
-- Editor. Keep this file, lib/supabase/types.ts, and AGENTS.md section 7 in
-- sync whenever a column is added or changed.
--
-- Access model: this app has no Supabase Auth and no per-user rows. All
-- reads and writes happen from server-only code using the service_role
-- client, which bypasses RLS entirely. RLS is enabled on every table below
-- as required for any table in the exposed `public` schema, with zero
-- policies for `anon` / `authenticated` (default deny).
--
-- pgvector / article_analyses.embedding is added later (AGENTS.md section 20)
-- after AI analysis is working. Not part of this file.

-- Shared trigger function to keep `updated_at` current on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. sources ------------------------------------------------------------

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  listing_url text not null unique,
  parser_strategy text,
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sources is 'service_role only -- no anon/authenticated policies by design.';

alter table public.sources enable row level security;

create trigger set_sources_updated_at
  before update on public.sources
  for each row
  execute function public.set_updated_at();

-- 2. articles -------------------------------------------------------------

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id),
  original_url text not null unique,
  canonical_url text not null unique,
  title text not null,
  image_url text not null,
  published_at timestamptz not null,
  raw_text text not null,
  scraped_at timestamptz not null default now(),
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.articles is 'service_role only -- no anon/authenticated policies by design.';

alter table public.articles enable row level security;

create index articles_source_id_idx on public.articles (source_id);
create index articles_published_at_idx on public.articles (published_at desc);

-- 3. article_analyses -----------------------------------------------------

create table public.article_analyses (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null unique references public.articles (id),
  summary text not null,
  sentiment_score numeric not null check (sentiment_score >= -1 and sentiment_score <= 1),
  sentiment_label text not null check (sentiment_label in ('positive', 'neutral', 'negative')),
  bias_score numeric not null check (bias_score >= -1 and bias_score <= 1),
  bias_label text not null check (bias_label in ('left', 'center', 'right', 'mixed', 'unclear')),
  left_percentage numeric not null check (left_percentage >= 0 and left_percentage <= 100),
  center_percentage numeric not null check (center_percentage >= 0 and center_percentage <= 100),
  right_percentage numeric not null check (right_percentage >= 0 and right_percentage <= 100),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  framing_notes text,
  loaded_terms text[] not null default '{}',
  disclaimer text not null,
  model text not null,
  created_at timestamptz not null default now(),
  constraint article_analyses_percentages_sum_100
    check (left_percentage + center_percentage + right_percentage = 100)
);

comment on table public.article_analyses is 'service_role only -- no anon/authenticated policies by design.';

alter table public.article_analyses enable row level security;

-- 4. logs -------------------------------------------------------------------

create table public.logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  context jsonb,
  created_at timestamptz not null default now()
);

comment on table public.logs is 'service_role only -- no anon/authenticated policies by design.';

alter table public.logs enable row level security;

create index logs_created_at_idx on public.logs (created_at desc);

-- 5. oxylabs_schedules --------------------------------------------------

-- oxylabs_schedule_id is `text`, never integer/bigint: Oxylabs schedule IDs
-- are 64-bit integers that exceed Number.MAX_SAFE_INTEGER and must be read
-- from raw HTTP response text, never JSON.parse'd (AGENTS.md section 18).
create table public.oxylabs_schedules (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null unique references public.sources (id),
  oxylabs_schedule_id text not null unique,
  schedule_config jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.oxylabs_schedules is 'service_role only -- no anon/authenticated policies by design.';

alter table public.oxylabs_schedules enable row level security;

create trigger set_oxylabs_schedules_updated_at
  before update on public.oxylabs_schedules
  for each row
  execute function public.set_updated_at();

-- 6. oxylabs_schedule_runs -------------------------------------------------

-- oxylabs_job_id is `text` for the same large-integer-precision reason as
-- oxylabs_schedule_id above.
create table public.oxylabs_schedule_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.oxylabs_schedules (id),
  oxylabs_job_id text not null unique,
  result_status text,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.oxylabs_schedule_runs is 'service_role only -- no anon/authenticated policies by design.';

alter table public.oxylabs_schedule_runs enable row level security;

create index oxylabs_schedule_runs_schedule_id_idx on public.oxylabs_schedule_runs (schedule_id);
create index oxylabs_schedule_runs_pending_idx on public.oxylabs_schedule_runs (result_status, processed);
