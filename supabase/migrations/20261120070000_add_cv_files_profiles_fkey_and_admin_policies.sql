-- Add foreign key relationship between cv_files and profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cv_files_user_id_profiles_fkey' 
      AND table_name = 'cv_files'
  ) THEN
    ALTER TABLE public.cv_files
      ADD CONSTRAINT cv_files_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Allow admins full access to cv_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cv_files' AND policyname = 'Admins can view all cv_files'
  ) THEN
    CREATE POLICY "Admins can view all cv_files"
    ON public.cv_files
    FOR SELECT
    TO authenticated
    USING (
      is_app_admin(auth.uid()) 
      OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin'::app_role, 'super_admin'::app_role)
          AND user_roles.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
          AND lower(auth.users.email) IN (
            'talentxcelpro@gmail.com',
            'talentxcelservices@gmail.com',
            'chatr4661@gmail.com',
            'arsh.wani@gmail.com',
            'arshid.wani@icloud.com',
            'sanobar.jahan1980@gmail.com'
          )
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cv_files' AND policyname = 'Admins can manage all cv_files'
  ) THEN
    CREATE POLICY "Admins can manage all cv_files"
    ON public.cv_files
    FOR ALL
    TO authenticated
    USING (
      is_app_admin(auth.uid()) 
      OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin'::app_role, 'super_admin'::app_role)
          AND user_roles.is_active = true
      )
    );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
