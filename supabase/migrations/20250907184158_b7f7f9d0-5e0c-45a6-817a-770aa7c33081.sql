-- 1. add slug column
alter table profiles
add column slug text;

-- 2. create a function to slugify names
create or replace function public.slugify(text) returns text as $$
declare
  s text := lower($1);
begin
  -- replace non-alphanum with dash, collapse multiple dashes, trim dashes
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  s := trim(both '-' from s);
  return s;
end;
$$ language plpgsql stable;

-- 3. trigger function to populate slug on insert/update
create or replace function public.profiles_generate_slug() returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(coalesce(new.full_name, 'user') || '-' || substr(gen_random_uuid()::text,1,6));
  end if;
  return new;
end;
$$ language plpgsql;

-- 4. add trigger
drop trigger if exists profiles_slug_tr on profiles;
create trigger profiles_slug_tr
before insert or update on profiles
for each row execute procedure public.profiles_generate_slug();

-- 5. populate existing profiles with slugs
update profiles 
set slug = public.slugify(coalesce(full_name, 'user') || '-' || substr(gen_random_uuid()::text,1,6))
where slug is null or slug = '';