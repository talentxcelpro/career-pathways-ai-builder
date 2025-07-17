-- Fix the foreign key relationship between services and profiles
ALTER TABLE public.services 
ADD CONSTRAINT services_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;