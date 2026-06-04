UPDATE public.profiles
SET banner_url = REPLACE(banner_url, 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/')
WHERE banner_url LIKE 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/%';

UPDATE public.profiles
SET profile_picture_url = REPLACE(profile_picture_url, 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/')
WHERE profile_picture_url LIKE 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/%';

UPDATE public.profiles
SET profile_photo_url = REPLACE(profile_photo_url, 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/')
WHERE profile_photo_url LIKE 'https://dthlgsnakhoftinssokm.functions.supabase.co/image-proxy/%';