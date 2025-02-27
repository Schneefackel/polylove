drop table public.users cascade;

create table if not exists
  public.users (
    created_time timestamp with time zone default now() not null,
    data jsonb not null,
    id text primary key default public.random_alphanumeric (12) not null,
    name text not null,
    username text not null
  );

-- Row Level Security
alter table users enable row level security;

-- Policies
drop policy if exists "public read" on users;

create policy "public read" on users for
select
  using (true);

-- Indexes
drop index if exists user_username_idx;

create index user_username_idx on public.users using btree (username);

drop index if exists users_created_time;

create index users_created_time on public.users using btree (created_time desc);

drop index if exists users_name_idx;

create index users_name_idx on public.users using btree (name);
