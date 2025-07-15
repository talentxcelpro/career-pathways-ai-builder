-- Create sample organization and audit logs with correct schema (fixed)
DO $$
DECLARE
    current_user_id UUID;
    sample_org_id UUID;
    hr_dept_id UUID;
BEGIN
    -- Get a user (take the first one from profiles)
    SELECT id INTO current_user_id FROM profiles LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Create a sample organization if it doesn't exist
        INSERT INTO organizations (name, slug, description, subscription_tier, created_by)
        VALUES (
            'TalentXcel Pro',
            'talentxcel-pro',
            'Technology company focused on talent management',
            'enterprise',
            current_user_id
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id INTO sample_org_id;
        
        -- Get the organization ID if it already existed
        IF sample_org_id IS NULL THEN
            SELECT id INTO sample_org_id FROM organizations WHERE slug = 'talentxcel-pro' LIMIT 1;
        END IF;
        
        -- Create sample departments if they don't exist
        INSERT INTO organization_departments (organization_id, name, description)
        VALUES 
            (sample_org_id, 'Human Resources', 'HR and People Operations'),
            (sample_org_id, 'Engineering', 'Software Development'),
            (sample_org_id, 'Marketing', 'Marketing and Communications'),
            (sample_org_id, 'Sales', 'Sales and Business Development'),
            (sample_org_id, 'Finance', 'Finance and Accounting')
        ON CONFLICT (organization_id, name) DO NOTHING;
        
        -- Get HR department ID
        SELECT id INTO hr_dept_id FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Human Resources';
        
        -- Assign the current user to the organization if not already assigned
        INSERT INTO user_department_assignments (user_id, organization_id, department_id)
        VALUES (current_user_id, sample_org_id, hr_dept_id)
        ON CONFLICT (user_id, organization_id) DO NOTHING;
        
        -- Create some sample audit logs
        INSERT INTO enterprise_audit_logs (organization_id, user_id, action_type, resource_type, event_details, created_at)
        VALUES 
            (sample_org_id, current_user_id, 'user_department_assigned', 'user', '{"department": "HR", "user": "John Doe"}', NOW() - INTERVAL '2 hours'),
            (sample_org_id, current_user_id, 'security_policy_updated', 'security', '{"policy": "password_requirements"}', NOW() - INTERVAL '1 day'),
            (sample_org_id, current_user_id, 'bulk_user_import', 'system', '{"imported_count": 25}', NOW() - INTERVAL '2 days'),
            (sample_org_id, current_user_id, 'department_created', 'department', '{"department": "Engineering"}', NOW() - INTERVAL '3 days'),
            (sample_org_id, current_user_id, 'user_role_updated', 'user', '{"user": "Jane Smith", "role": "admin"}', NOW() - INTERVAL '4 days')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample enterprise data created for organization: %', sample_org_id;
    ELSE
        RAISE NOTICE 'No users found in profiles table. Please ensure users exist before running this migration.';
    END IF;
END $$;