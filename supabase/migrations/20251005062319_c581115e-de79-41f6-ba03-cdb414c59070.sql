-- Enhanced user role assignment with better error handling and logging

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Create improved function to handle new user role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the new user creation for debugging
  RAISE NOTICE 'New user created: %, Email: %', NEW.id, NEW.email;
  
  -- Insert default 'user' role for new users
  INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
  VALUES (NEW.id, 'user', true, now(), now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    is_active = true,
    updated_at = now();
  
  RAISE NOTICE 'User role assigned successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to assign user role for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill existing users who don't have roles
INSERT INTO public.user_roles (user_id, role, is_active, created_at, updated_at)
SELECT id, 'user', true, now(), now()
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.user_roles WHERE is_active = true)
ON CONFLICT (user_id, role) 
DO UPDATE SET 
  is_active = true,
  updated_at = now();

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active ON public.user_roles(user_id, is_active) WHERE is_active = true;