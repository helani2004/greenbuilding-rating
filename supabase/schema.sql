-- Rating standards and their versions
create table if not exists public.rating_standards (
  id text primary key,
  document jsonb not null,
  revision integer not null default 1,
  created_at timestamptz not null default now()
);

-- Building assessments and saved answers
create table if not exists public.rating_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  standard_id text not null
    references public.rating_standards(id),
  data jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Accounts allowed to manage standards
create table if not exists public.rating_admins (
  user_id uuid primary key references auth.users(id),
  created_at timestamptz not null default now()
);

-- Restrict direct browser access.
-- The backend will check account and project permissions.
alter table public.rating_standards
  enable row level security;

alter table public.rating_projects
  enable row level security;

alter table public.rating_admins
  enable row level security;

revoke all on table
  public.rating_standards,
  public.rating_projects,
  public.rating_admins
from anon, authenticated;

grant select, insert, update, delete on table
  public.rating_standards,
  public.rating_projects,
  public.rating_admins
to service_role;

create index if not exists rating_projects_owner_idx
  on public.rating_projects(owner_id);
