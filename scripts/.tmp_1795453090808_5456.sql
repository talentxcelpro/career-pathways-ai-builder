
    BEGIN;
    SET LOCAL request.jwt.claim.sub = '0f808047-f6bb-43f7-873c-d5ede605733b';
    SET LOCAL role = 'authenticated';
    SELECT get_profile_visitors(10, 0) as result;
    COMMIT;
    