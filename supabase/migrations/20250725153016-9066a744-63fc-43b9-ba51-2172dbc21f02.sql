-- Fix the trigger function to use correct field names
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    profile_picture_url,
    location,
    oauth_provider,
    oauth_metadata,
    profile_data_source
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      concat(new.raw_user_meta_data->>'given_name', ' ', new.raw_user_meta_data->>'family_name')
    ),
    coalesce(
      new.raw_user_meta_data->>'picture',
      new.raw_user_meta_data->>'avatar_url'
    ),
    new.raw_user_meta_data->>'location',
    case 
      when new.raw_user_meta_data->>'iss' like '%google%' then 'google'
      when new.raw_user_meta_data->>'iss' like '%linkedin%' then 'linkedin'
      when new.raw_user_meta_data ? 'provider' then new.raw_user_meta_data->>'provider'
      else 'email'
    end,
    new.raw_user_meta_data,
    'oauth'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    profile_picture_url = coalesce(excluded.profile_picture_url, profiles.profile_picture_url),
    location = coalesce(excluded.location, profiles.location),
    oauth_provider = excluded.oauth_provider,
    oauth_metadata = excluded.oauth_metadata,
    profile_data_source = excluded.profile_data_source,
    updated_at = now();
  
  return new;
end;
$$ language plpgsql security definer;