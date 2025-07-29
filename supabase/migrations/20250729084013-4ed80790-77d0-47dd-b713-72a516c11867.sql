-- Let's first check who the current authenticated user is and if there are any users
SELECT auth.uid() as current_user_id, 'Current authenticated user' as description;

-- Check if there are any existing profiles that could be made admin
SELECT id, full_name, email, created_at 
FROM profiles 
WHERE email = 'talentxcelpro@gmail.com'
LIMIT 1;