create schema users;

grant usage on schema users to service_role;

grant all on all tables in schema users to service_role;
grant all on all routines in schema users to service_role;
grant all on all sequences in schema users to service_role;

alter default privileges for role postgres in schema users grant all on tables to service_role;
alter default privileges for role postgres in schema users grant all on routines to service_role;
alter default privileges for role postgres in schema users grant all on sequences to service_role;

create type users.app_role as enum ('admin');
create type users.app_permission as enum (
  'app_role.read',
  'app_role.write'
);

-- USER ROLES
create table users.user_roles (
  user_id   uuid unique not null references auth.users on delete cascade,
  role      users.app_role not null,
  unique (user_id, role)
);
comment on table users.user_roles is 'Application roles for each user.';

alter table users.user_roles enable row level security;

create or replace function users.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
set search_path to ''
stable
as $$
  declare
    claims jsonb;
    user_role users.app_role;
  begin
    select role into user_role from users.user_roles where user_id = (event->>"user_id")::uuid;
    claims := event->'claims';

    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
      event := jsonb_set(event, '{claims}', claims);
    end if;

    return event;
  end;
$$;

grant usage on schema users to supabase_auth_admin;

grant execute
  on function users.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function users.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table users.user_roles
  to supabase_auth_admin;

revoke all
  on table users.user_roles
  from authenticated, anon, public;

create policy "Allow auth admin to read user roles" ON users.user_roles
  as permissive for select
  to supabase_auth_admin
  using (true);
