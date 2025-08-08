-- Function to clean up test users and duplicates (FINAL VERSION)
CREATE OR REPLACE FUNCTION clean_test_users_and_duplicates()
RETURNS TABLE(
  deleted_profiles INTEGER,
  deleted_cv_files INTEGER,
  deleted_bulk_batches INTEGER,
  cleanup_summary TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_count INTEGER := 0;
  cv_count INTEGER := 0;
  batch_count INTEGER := 0;
  test_profile_ids UUID[];
BEGIN
  -- Get all test profile IDs
  SELECT ARRAY_AGG(id) INTO test_profile_ids
  FROM profiles 
  WHERE 
    full_name ILIKE 'Test User%' OR 
    full_name = 'Candidate' OR
    full_name ILIKE '%Draft%' OR
    full_name ILIKE 'Akhil Resume%' OR
    email ILIKE '%@upload.local' OR
    email ILIKE '%@test.com' OR
    email ILIKE '%@example.com' OR
    email ILIKE 'test%@example.com' OR
    email = 'user@example.com' OR
    -- Find duplicates (keep only the first occurrence based on email+name)
    id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY full_name, email ORDER BY created_at) as rn
        FROM profiles 
        WHERE full_name IS NOT NULL AND email IS NOT NULL
        AND full_name != '' AND email != ''
      ) duplicates WHERE rn > 1
    );

  -- Log what we found
  RAISE NOTICE 'Found % test profiles to delete', COALESCE(array_length(test_profile_ids, 1), 0);

  -- Only proceed if we found test profiles
  IF test_profile_ids IS NOT NULL AND array_length(test_profile_ids, 1) > 0 THEN
    
    -- Delete related CV files first (cv_files.user_id = profiles.id)
    DELETE FROM cv_files 
    WHERE user_id = ANY(test_profile_ids);
    GET DIAGNOSTICS cv_count = ROW_COUNT;

    -- Delete bulk upload batches uploaded by test users
    DELETE FROM bulk_upload_batches 
    WHERE uploaded_by = ANY(test_profile_ids);
    GET DIAGNOSTICS batch_count = ROW_COUNT;

    -- Delete user roles for test users
    DELETE FROM user_roles 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete AI resumes for test users
    DELETE FROM ai_resumes 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete career passport entries
    DELETE FROM career_passport 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete user activities
    DELETE FROM user_activities 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete job applications
    DELETE FROM job_applications 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete connections (both as requester and recipient)
    DELETE FROM connections 
    WHERE requester_id = ANY(test_profile_ids) OR recipient_id = ANY(test_profile_ids);

    -- Delete posts
    DELETE FROM posts 
    WHERE user_id = ANY(test_profile_ids) OR author_id = ANY(test_profile_ids);

    -- Delete notifications
    DELETE FROM notifications 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete AI usage logs
    DELETE FROM ai_usage_logs 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete AI chat sessions and messages
    DELETE FROM ai_chat_messages 
    WHERE user_id = ANY(test_profile_ids);
    
    DELETE FROM ai_chat_sessions 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete AI cover letters
    DELETE FROM ai_cover_letters 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete AI cover letters enhanced
    DELETE FROM ai_cover_letters_enhanced 
    WHERE user_id = ANY(test_profile_ids);

    -- Delete any other AI-related data
    DELETE FROM ai_job_matches 
    WHERE user_id = ANY(test_profile_ids);

    -- Finally delete the profiles
    DELETE FROM profiles WHERE id = ANY(test_profile_ids);
    GET DIAGNOSTICS profile_count = ROW_COUNT;

  END IF;

  RETURN QUERY SELECT 
    profile_count,
    cv_count,
    batch_count,
    CASE 
      WHEN profile_count > 0 THEN 
        'Successfully cleaned up ' || profile_count || ' test profiles, ' || 
        cv_count || ' CV files, and ' || batch_count || ' bulk batches'
      ELSE 'No test users found to clean up'
    END;
END;
$$;

-- Execute the cleanup immediately
SELECT * FROM clean_test_users_and_duplicates();