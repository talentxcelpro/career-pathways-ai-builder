
-- First, let's see what values are currently allowed in the user_role enum
-- and add the missing 'candidate' value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'candidate';

-- Also ensure we have the other common role values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
