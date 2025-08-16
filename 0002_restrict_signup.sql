-- Custom SQL migration file, put your code below! --

-- Function to check for a valid invitation before a user is created.
-- Throws an error if no matching and unclaimed invitation is found.
create or replace function public.verify_authorization()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
	if not exists (select 1 from public.members where email = new.email and fk_auth_id is null) then
		raise exception 'User is not invited or the invitation has already been claimed.';
	end if;
	return new;
end;
$$;

create trigger before_user_signup_check_invitation
  before insert on auth.users
  for each row execute procedure public.verify_authorization();

create or replace function public.link_member()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
	update public.members
	set fk_auth_id = new.id
	where email = new.email;
	return new;
end;
$$;

create trigger after_user_signup_link_member
	after insert on auth.users
	for each row execute procedure public.link_member();
