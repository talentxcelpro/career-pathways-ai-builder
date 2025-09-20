-- Test if companies table is accessible and create a simple test query
DO $$
DECLARE
    company_count INTEGER;
    follow_count INTEGER;
BEGIN
    -- Test companies table access
    SELECT COUNT(*) INTO company_count FROM public.companies;
    RAISE NOTICE 'Companies table accessible. Count: %', company_count;
    
    -- Test company_follows table access  
    SELECT COUNT(*) INTO follow_count FROM public.company_follows;
    RAISE NOTICE 'Company follows table accessible. Count: %', follow_count;
    
    -- Test join between tables
    SELECT COUNT(*) INTO follow_count 
    FROM public.company_follows cf 
    JOIN public.companies c ON cf.company_id = c.id;
    RAISE NOTICE 'Join between tables works. Valid follows: %', follow_count;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;