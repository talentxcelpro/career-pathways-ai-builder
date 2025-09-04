-- Batch 12: Fix remaining 6 Security Definer Views using system catalogs
-- Use pg_class and pg_rewrite to find all views with SECURITY DEFINER

DO $$
DECLARE
    view_record RECORD;
    view_def TEXT;
    clean_def TEXT;
BEGIN
    -- Find all views with SECURITY DEFINER by examining pg_rewrite
    FOR view_record IN 
        SELECT 
            n.nspname as schema_name,
            c.relname as view_name
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_rewrite r ON r.ev_class = c.oid
        WHERE c.relkind = 'v'  -- views only
        AND n.nspname = 'public'
        AND r.ev_action::text ILIKE '%SECURITY DEFINER%'
    LOOP
        -- Get the view definition using pg_get_viewdef
        BEGIN
            SELECT pg_get_viewdef(view_record.schema_name||'.'||view_record.view_name, true) INTO view_def;
            
            -- Remove SECURITY DEFINER from the definition
            clean_def := view_def;
            clean_def := regexp_replace(clean_def, '\s+SECURITY\s+DEFINER', '', 'gi');
            
            -- Drop and recreate the view
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schema_name, view_record.view_name);
            EXECUTE format('CREATE VIEW %I.%I AS %s', view_record.schema_name, view_record.view_name, clean_def);
            
            RAISE NOTICE 'Fixed security definer view: %.%', view_record.schema_name, view_record.view_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to fix view %.%: %', view_record.schema_name, view_record.view_name, SQLERRM;
        END;
    END LOOP;
    
    -- Also check if there are any remaining views by examining pg_views with case variations
    FOR view_record IN 
        SELECT schemaname, viewname, definition
        FROM pg_views 
        WHERE schemaname = 'public'
        AND (definition ILIKE '%security definer%' OR definition ILIKE '%SECURITY DEFINER%')
    LOOP
        BEGIN
            -- Clean the definition
            clean_def := view_record.definition;
            clean_def := regexp_replace(clean_def, '\s+SECURITY\s+DEFINER', '', 'gi');
            clean_def := regexp_replace(clean_def, '\s+security\s+definer', '', 'gi');
            
            -- Drop and recreate
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
            EXECUTE format('CREATE VIEW %I.%I AS %s', view_record.schemaname, view_record.viewname, clean_def);
            
            RAISE NOTICE 'Fixed view from pg_views: %.%', view_record.schemaname, view_record.viewname;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to fix pg_views view %.%: %', view_record.schemaname, view_record.viewname, SQLERRM;
        END;
    END LOOP;
END $$;