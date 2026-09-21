-- ═══════════════════════════════════════════════════════════
--  LEXIBOOKS — schema
--  Run this in the Supabase SQL Editor (Database → SQL Editor).
--  Safe to re-run: every object is created if-not-exists or
--  dropped first.
-- ═══════════════════════════════════════════════════════════

-- ── BOOKS ────────────────────────────────────────────────
-- A *title* (the work itself), not a physical object.
create table if not exists books (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text not null,
  cover_url     text,
  quote         text,
  description   text,

  -- Multi-label fields. Arrays rather than join tables: at a few
  -- hundred titles they are simpler and just as fast, and they
  -- map directly onto "click any filter".
  genre         text[] not null default '{}',
  tropes        text[] not null default '{}',
  moods         text[] not null default '{}',
  formats       text[] not null default '{}',

  age_min       int check (age_min >= 0),
  age_max       int check (age_max >= age_min),
  page_count    int check (page_count > 0),

  -- Dormant until the selling side is built. Nothing reads these yet.
  price_cents   int check (price_cents >= 0),
  is_for_sale   boolean not null default false,

  created_at    timestamptz not null default now()
);

-- ── COPIES ───────────────────────────────────────────────
-- One row per physical book on the shelf. This is what makes
-- inventory trackable: one copy goes to exactly one person.
create table if not exists copies (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references books(id) on delete cascade,
  condition   text not null default 'good'
                check (condition in ('new', 'good', 'worn')),

  -- A copy has exactly one status, so it can never be both given
  -- away and sold. The constraint lives here, in the database,
  -- where an application bug cannot get around it.
  status      text not null default 'available'
                check (status in ('available', 'reserved', 'given', 'sold')),

  donated_by  text,
  claimed_by  uuid references auth.users(id) on delete set null,
  claimed_at  timestamptz,
  created_at  timestamptz not null default now(),

  -- A claimed copy must record when it was claimed, and an
  -- available copy must not look claimed.
  constraint claim_is_consistent check (
    (status in ('available', 'reserved') and claimed_at is null)
    or (status in ('given', 'sold') and claimed_at is not null)
  )
);

-- ── QUESTIONNAIRE RESPONSES ──────────────────────────────
create table if not exists questionnaire_responses (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  age_range       text,
  notes           text,

  -- The five answers, kept as jsonb so the questions can change
  -- without a migration.
  answers         jsonb not null default '{}'::jsonb,

  matched_book_id uuid references books(id) on delete set null,
  status          text not null default 'new'
                    check (status in ('new', 'matched', 'sent', 'closed')),
  created_at      timestamptz not null default now()
);

-- ── INDEXES ──────────────────────────────────────────────
-- GIN indexes make the array-overlap filters fast:
--   select * from books where genre && '{Dystopian}';
create index if not exists books_genre_idx  on books using gin (genre);
create index if not exists books_tropes_idx on books using gin (tropes);
create index if not exists books_moods_idx  on books using gin (moods);
create index if not exists books_formats_idx on books using gin (formats);

-- Keeps the seed re-runnable and stops the same title being added
-- twice by two different volunteers.
create unique index if not exists books_title_author_idx
  on books (lower(title), lower(author));

create index if not exists copies_book_id_idx on copies (book_id);
create index if not exists copies_status_idx  on copies (status);

create index if not exists responses_created_idx
  on questionnaire_responses (created_at desc);

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--
--  The anon key is public — it is visible in the page source of
--  the site. RLS, not key secrecy, is what actually protects the
--  data. These policies assume the anon key is in the hands of
--  anyone who views the page, because it is.
-- ═══════════════════════════════════════════════════════════

alter table books                   enable row level security;
alter table copies                  enable row level security;
alter table questionnaire_responses enable row level security;

-- Books: a public catalogue. Anyone may read, nobody may write.
-- The team adds books through the Supabase dashboard.
drop policy if exists "books are publicly readable" on books;
create policy "books are publicly readable"
  on books for select
  to anon, authenticated
  using (true);

-- Copies: readable so the site can show what is in stock.
-- Writes are dashboard-only for now.
drop policy if exists "copies are publicly readable" on copies;
create policy "copies are publicly readable"
  on copies for select
  to anon, authenticated
  using (true);

-- Questionnaire responses: INSERT ONLY.
--
-- This is the important one. Responses hold names, emails and age
-- ranges of readers, some of them minors. There is deliberately no
-- SELECT policy, so the public key can submit a response but can
-- never read one back — not even its own. Your team reads them in
-- the Supabase dashboard, which uses the service_role key and
-- bypasses RLS.
--
-- Do not add a SELECT policy for `anon` on this table.
drop policy if exists "anyone may submit a response" on questionnaire_responses;
create policy "anyone may submit a response"
  on questionnaire_responses for insert
  to anon, authenticated
  with check (true);
