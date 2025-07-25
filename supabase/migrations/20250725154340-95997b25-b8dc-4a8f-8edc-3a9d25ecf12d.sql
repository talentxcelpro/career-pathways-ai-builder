-- Simplify the trigger function to avoid metadata issues
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name,
    oauth_provider
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'given_name' || ' ' || new.raw_user_meta_data->>'family_name'
    ),
    case 
      when new.raw_user_meta_data->>'iss' like '%google%' then 'google'
      when new.raw_user_meta_data->>'iss' like '%linkedin%' then 'linkedin'
      else 'email'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    oauth_provider = excluded.oauth_provider,
    updated_at = now();
  
  return new;
end;
$$ language plpgsql security definer;