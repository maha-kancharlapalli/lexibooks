-- ═══════════════════════════════════════════════════════════
--  LEXIBOOKS — membership waitlist
--  Captures interest before memberships open. Same RLS shape as
--  questionnaire_responses: anyone may submit, nobody may read
--  back with the public key.
-- ═══════════════════════════════════════════════════════════

create table if not exists membership_interest (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  pace        text,
  plan        text not null default 'Reader''s Pass',
  price_cents int  check (price_cents >= 0),
  status      text not null default 'waiting'
                check (status in ('waiting', 'invited', 'joined', 'declined')),
  created_at  timestamptz not null default now()
);

create index if not exists membership_interest_created_idx
  on membership_interest (created_at desc);

alter table membership_interest enable row level security;

-- Insert only. There is deliberately no SELECT policy: the waitlist
-- holds names and emails, and the anon key is public in the page
-- source. Read these in the Supabase dashboard instead.
drop policy if exists "anyone may join the waitlist" on membership_interest;
create policy "anyone may join the waitlist"
  on membership_interest for insert
  to anon, authenticated
  with check (true);
