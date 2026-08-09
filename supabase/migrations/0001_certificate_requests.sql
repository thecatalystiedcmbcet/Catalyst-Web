-- Activity Point Certificate System
-- Run this in the Supabase SQL editor for this project. Schema/RLS are not
-- applied automatically by this repo — there is no migration runner wired up.

create table if not exists certificate_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  discord_username text,
  department text not null,
  batch text not null,
  muid text not null,
  mulearn_rank text not null,
  karma integer not null,
  rank_card_url text,
  reason text not null,
  points_claimed integer not null check (points_claimed in (25, 50)),
  delivery_method text not null default 'email' check (delivery_method in ('email', 'discord', 'both')),
  status text not null default 'pending' check (status in ('pending', 'issued', 'rejected')),
  rejection_reason text,
  points_awarded integer check (points_awarded in (25, 50)),
  certificate_number text unique,
  certificate_url text,
  reviewed_at timestamptz
);

alter table certificate_requests enable row level security;

-- Public form can only insert a fresh pending request — never read existing rows
-- (including its own), never set the outcome fields directly.
create policy "public can submit requests"
  on certificate_requests for insert
  to anon
  with check (
    status = 'pending'
    and points_awarded is null
    and certificate_url is null
    and certificate_number is null
  );

-- Authenticated admins (signed in via /admin/login) can read/update everything.
create policy "admins can manage requests"
  on certificate_requests for all
  to authenticated
  using (true)
  with check (true);

-- Storage: create a public "certificates" bucket for generated PDFs via the
-- Supabase dashboard (Storage -> New bucket -> public). Only the server-side
-- service-role client writes to it (app/api/certificates/review), so no
-- public INSERT/UPDATE policy is needed on that bucket's objects — just
-- public SELECT (read) for the generated files to be downloadable.

-- Rank-card proof uploads reuse the existing public "image" bucket under the
-- "certificate-proofs/" folder, matching the existing anon-writable policy
-- used by other public-facing uploads on this bucket.
