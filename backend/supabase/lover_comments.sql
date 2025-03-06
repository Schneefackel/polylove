-- This file is autogenerated from regen-schema.ts
create table if not exists
  lover_comments (
    content jsonb not null,
    created_time timestamp with time zone default now() not null,
    hidden boolean default false not null,
    id bigint primary key lover_comments_pkey generated always as identity not null,
    on_user_id text not null,
    reply_to_comment_id bigint,
    user_avatar_url text not null,
    user_id text not null,
    user_name text not null,
    user_username text not null
  );

-- Row Level Security
alter table lover_comments enable row level security;

-- Policies
drop policy if exists "public read" on lover_comments;

create policy "public read" on lover_comments for all using (true);

-- Indexes
drop index if exists lover_comments_pkey;

create unique index lover_comments_pkey on public.lover_comments using btree (id);

drop index if exists lover_comments_user_id_idx;

create index lover_comments_user_id_idx on public.lover_comments using btree (on_user_id);
