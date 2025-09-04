-- Batch 11: Fix remaining Security Definer Views
-- There are still 6 more SECURITY DEFINER views that need to be fixed

-- Let's identify and fix them by checking the remaining views
-- First, let's see what views still have SECURITY DEFINER

-- Drop and recreate problematic views without SECURITY DEFINER
-- These might be views we haven't addressed yet

-- Check if there are any remaining views with SECURITY DEFINER and remove it
-- This query will help us identify them
DO $$
DECLARE
    view_record RECORD;
    view_definition TEXT;
BEGIN
    -- Get all views that might have SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND viewname NOT IN ('agent_performance', 'agent_task_summary')
    LOOP
        -- Get the view definition
        SELECT definition INTO view_definition
        FROM pg_views 
        WHERE schemaname = view_record.schemaname 
        AND viewname = view_record.viewname;
        
        -- Check if it contains SECURITY DEFINER
        IF view_definition ILIKE '%SECURITY DEFINER%' THEN
            -- Drop and recreate without SECURITY DEFINER
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
            
            -- Remove SECURITY DEFINER from definition and recreate
            view_definition := REPLACE(view_definition, ' SECURITY DEFINER', '');
            view_definition := REPLACE(view_definition, ' security definer', '');
            
            EXECUTE format('CREATE VIEW %I.%I AS %s', view_record.schemaname, view_record.viewname, view_definition);
            
            RAISE NOTICE 'Fixed view: %.%', view_record.schemaname, view_record.viewname;
        END IF;
    END LOOP;
END $$;