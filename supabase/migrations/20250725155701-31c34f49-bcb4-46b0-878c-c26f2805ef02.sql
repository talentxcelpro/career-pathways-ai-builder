-- Create a minimal trigger function that only handles essential profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email
  )
  values (
    new.id,
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  
  return new;
end;
$$ language plpgsql security definer;