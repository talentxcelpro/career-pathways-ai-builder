-- Fix NULL confirmation_token values in auth.users for bot accounts
-- This addresses the "Database error querying schema" issue

-- Update all users with NULL confirmation_token to have an empty string
-- This is safer than touching the auth schema directly
UPDATE auth.users 
SET confirmation_token = COALESCE(confirmation_token, '')
WHERE confirmation_token IS NULL;