-- Simple sample data creation without conflicts
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
        SELECT 
            'TalentXcel Pro',
            'talentxcel-pro',
            'Technology company focused on talent management',
            'enterprise',
            current_user_id
        WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'talentxcel-pro')
        RETURNING id INTO sample_org_id;
        
        -- Get the organization ID if it already existed
        IF sample_org_id IS NULL THEN
            SELECT id INTO sample_org_id FROM organizations WHERE slug = 'talentxcel-pro' LIMIT 1;
        END IF;
        
        -- Create sample departments
        INSERT INTO organization_departments (organization_id, name, description)
        SELECT sample_org_id, 'Human Resources', 'HR and People Operations'
        WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Human Resources');
        
        INSERT INTO organization_departments (organization_id, name, description)
        SELECT sample_org_id, 'Engineering', 'Software Development'
        WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Engineering');
        
        INSERT INTO organization_departments (organization_id, name, description)
        SELECT sample_org_id, 'Marketing', 'Marketing and Communications'
        WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Marketing');
        
        -- Get HR department ID
        SELECT id INTO hr_dept_id FROM organization_departments WHERE organization_id = sample_org_id AND name = 'Human Resources';
        
        -- Create some sample audit logs
        INSERT INTO enterprise_audit_logs (organization_id, user_id, action_type, resource_type, event_details, created_at)
        SELECT sample_org_id, current_user_id, 'user_department_assigned', 'user', '{"department": "HR", "user": "John Doe"}', NOW() - INTERVAL '2 hours'
        WHERE NOT EXISTS (SELECT 1 FROM enterprise_audit_logs WHERE organization_id = sample_org_id AND action_type = 'user_department_assigned');
        
        INSERT INTO enterprise_audit_logs (organization_id, user_id, action_type, resource_type, event_details, created_at)
        SELECT sample_org_id, current_user_id, 'security_policy_updated', 'security', '{"policy": "password_requirements"}', NOW() - INTERVAL '1 day'
        WHERE NOT EXISTS (SELECT 1 FROM enterprise_audit_logs WHERE organization_id = sample_org_id AND action_type = 'security_policy_updated');
        
        INSERT INTO enterprise_audit_logs (organization_id, user_id, action_type, resource_type, event_details, created_at)
        SELECT sample_org_id, current_user_id, 'bulk_user_import', 'system', '{"imported_count": 25}', NOW() - INTERVAL '2 days'
        WHERE NOT EXISTS (SELECT 1 FROM enterprise_audit_logs WHERE organization_id = sample_org_id AND action_type = 'bulk_user_import');
        
        RAISE NOTICE 'Sample enterprise data created for organization: %', sample_org_id;
    ELSE
        RAISE NOTICE 'No users found in profiles table. Please ensure users exist before running this migration.';
    END IF;
END $$;