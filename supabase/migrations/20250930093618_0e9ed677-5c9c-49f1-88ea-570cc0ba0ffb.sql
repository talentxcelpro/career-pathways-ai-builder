-- Add missing columns to profiles table for CV processing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cv_file_id UUID REFERENCES public.cv_files(id),
ADD COLUMN IF NOT EXISTS activation_status TEXT DEFAULT 'pending';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_cv_file_id ON public.profiles(cv_file_id);
CREATE INDEX IF NOT EXISTS idx_profiles_activation_status ON public.profiles(activation_status);