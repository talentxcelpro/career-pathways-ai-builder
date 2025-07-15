-- Ensure we have some sample data for the enterprise dashboard

-- First, let's get the current user to assign to the organization
DO $$
DECLARE
    current_user_id UUID;
    sample_org_id UUID;
    hr_dept_id UUID;
    eng_dept_id UUID;
BEGIN
    -- Get a user (take the first one from profiles)
    SELECT id INTO current_user_id FROM profiles LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Create a sample organization if it doesn't exist
        INSERT INTO organizations (name, industry, size, settings)
        VALUES (
            'TalentXcel Pro',
            'Technology',
            'medium',
            jsonb_build_object(
                'timezone', 'UTC',
                'currency', 'USD',
                'security_policy', jsonb_build_object(
                    'password_policy', 'strong',
                    'mfa_required', true,
                    'session_timeout', 480
                )
            )
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO sample_org_id;
        
        -- Get the organization ID if it already existed
        IF sample_org_id IS NULL THEN
            SELECT id INTO sample_org_id FROM organizations WHERE name = 'TalentXcel Pro' LIMIT 1;
        END IF;
        
        -- Create sample departments
        INSERT INTO organization_departments (organization_id, name, description)
        VALUES 
            (sample_org_id, 'Human Resources', 'HR and People Operations'),
            (sample_org_id, 'Engineering', 'Software Development'),
            (sample_org_id, 'Marketing', 'Marketing and Communications'),
            (sample_org_id, 'Sales', 'Sales and Business Development'),
            (sample_org_id, 'Finance', 'Finance and Accounting')
        ON CONFLICT (organization_id, name) DO NOTHING;
        
        -- Get department IDs
        SELECT id INTO hr_dept_id FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Human Resources';
        SELECT id INTO eng_dept_id FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Engineering';
        
        -- Assign the current user to the organization
        INSERT INTO user_department_assignments (user_id, organization_id, department_id, role_id)
        SELECT 
            current_user_id,
            sample_org_id,
            hr_dept_id,
            (SELECT id FROM organization_roles WHERE name = 'Admin' AND organization_id = sample_org_id LIMIT 1)
        ON CONFLICT DO NOTHING;
        
        -- Create some sample audit logs
        INSERT INTO enterprise_audit_logs (organization_id, action, details, created_at)
        VALUES 
            (sample_org_id, 'User added to HR department', jsonb_build_object('department', 'HR', 'user', 'John Doe'), NOW() - INTERVAL '2 hours'),
            (sample_org_id, 'Security policy updated', jsonb_build_object('policy', 'password_requirements'), NOW() - INTERVAL '1 day'),
            (sample_org_id, 'Bulk user import completed', jsonb_build_object('imported_count', 25), NOW() - INTERVAL '2 days'),
            (sample_org_id, 'New department created', jsonb_build_object('department', 'Engineering'), NOW() - INTERVAL '3 days'),
            (sample_org_id, 'User role updated', jsonb_build_object('user', 'Jane Smith', 'role', 'admin'), NOW() - INTERVAL '4 days')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample enterprise data created for organization: %', sample_org_id;
    ELSE
        RAISE NOTICE 'No users found in profiles table. Please ensure users exist before running this migration.';
    END IF;
END $$;