-- This file is copied from https://github.com/manifoldmarkets/manifold/blob/main/backend/supabase/reports.sql
create table if not exists
  reports (
    content_id text not null,
    content_owner_id text not null,
    content_type text not null,
    created_time timestamp with time zone default now(),
    description text,
    id text default uuid_generate_v4 () not null,
    parent_id text,
    parent_type text,
    user_id text not null
  );

-- Foreign Keys
alter table reports
add constraint reports_content_owner_id_fkey foreign key (content_owner_id) references users (id);

alter table reports
add constraint reports_user_id_fkey foreign key (user_id) references users (id);

-- Row Level Security
alter table reports enable row level security;
