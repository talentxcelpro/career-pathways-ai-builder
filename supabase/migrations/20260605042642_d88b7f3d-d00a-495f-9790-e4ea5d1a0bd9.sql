
SET session_replication_role = replica;

WITH ts AS (SELECT extract(epoch from now())::bigint::text AS v)
UPDATE profiles SET
  profile_picture_url = CASE
    WHEN profile_picture_url IS NULL THEN NULL
    ELSE (
      WITH cleaned AS (
        SELECT regexp_replace(
          replace(profile_picture_url, 'https://images.talentxcel.in/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'),
          '^https://[^/]+\.functions\.supabase\.co/(image-proxy|storage-proxy)/',
          'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'
        ) AS u
      )
      SELECT CASE WHEN u ~ '[?&]v=[0-9]+'
        THEN regexp_replace(u, '([?&])v=[0-9]+', '\1v=' || (SELECT v FROM ts))
        ELSE u || (CASE WHEN u LIKE '%?%' THEN '&' ELSE '?' END) || 'v=' || (SELECT v FROM ts)
      END FROM cleaned
    )
  END,
  profile_photo_url = CASE
    WHEN profile_photo_url IS NULL THEN NULL
    ELSE (
      WITH cleaned AS (
        SELECT regexp_replace(
          replace(profile_photo_url, 'https://images.talentxcel.in/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'),
          '^https://[^/]+\.functions\.supabase\.co/(image-proxy|storage-proxy)/',
          'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'
        ) AS u
      )
      SELECT CASE WHEN u ~ '[?&]v=[0-9]+'
        THEN regexp_replace(u, '([?&])v=[0-9]+', '\1v=' || (SELECT v FROM ts))
        ELSE u || (CASE WHEN u LIKE '%?%' THEN '&' ELSE '?' END) || 'v=' || (SELECT v FROM ts)
      END FROM cleaned
    )
  END,
  banner_url = CASE
    WHEN banner_url IS NULL THEN NULL
    ELSE (
      WITH cleaned AS (
        SELECT regexp_replace(
          replace(banner_url, 'https://images.talentxcel.in/image-proxy/', 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'),
          '^https://[^/]+\.functions\.supabase\.co/(image-proxy|storage-proxy)/',
          'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/'
        ) AS u
      )
      SELECT CASE WHEN u ~ '[?&]v=[0-9]+'
        THEN regexp_replace(u, '([?&])v=[0-9]+', '\1v=' || (SELECT v FROM ts))
        ELSE u || (CASE WHEN u LIKE '%?%' THEN '&' ELSE '?' END) || 'v=' || (SELECT v FROM ts)
      END FROM cleaned
    )
  END
WHERE profile_picture_url IS NOT NULL OR profile_photo_url IS NOT NULL OR banner_url IS NOT NULL;

SET session_replication_role = origin;
