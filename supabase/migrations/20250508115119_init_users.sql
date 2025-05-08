-- User profiles
create table users.profiles (
  id bigint generated always as identity primary key,
  firstname varchar(64) not null,
  lastname varchar(64) not null,
  username varchar(64),
  email varchar(64) unique not null
);
comment on table users.profiles is 'Registered and invited user profiles.';

-- SP authed (ie. registered) profiles
create table users.authed_profiles (
  fk_profile_id bigint not null unique references users.profiles(id),
  fk_auth_id uuid not null unique references auth.users(id) on delete cascade
);
comment on table users.authed_profiles is 'Registered users will have auth.users(id) relation.';

-- Function to delete profile when auth.user is deleted
create or replace function users.del_profile_after_authed_profiles_del()
  returns trigger
  language plpgsql
  set search_path to ''
as $$
  begin
    delete from users.profiles where id = old.fk_profile_id;
    return null;
  end;
$$;

-- Trigger to call deletion of profile after deletion of authed_profiles
create trigger del_profile
  after delete on users.authed_profiles
  for each row
  execute function users.del_profile_after_authed_profiles_del();

-- Bokklubben Titles
create table users.bk_titles (
  id smallint unique generated always as identity primary key,
  name varchar(64) unique not null
);
comment on table users.bk_titles is 'Bokklubben titles for users';
-- alter table users.bk_titles enable row level security;

-- Inser prelim BK titiles
insert into users.bk_titles(name)
values
  ('CTO'),
  ('CFO'),
  ('WHIP'),
  ('BUREAUCRAT'),
  ('USURPER'),
  ('EXECUTIONER'),
  ('PROBATE'),
  ('HONORARY'),
  ('FOUNDING_FATHER');

-- Relation between BK titles and profiles
create table users.profile_bk_title (
  fk_profile_id bigint not null references users.profiles(id) on delete cascade,
  fk_bk_title_id smallint not null references users.bk_titles(id) on delete cascade
);
comment on table users.profile_bk_title is 'Referance table for profile ids and bk_title ids.';
