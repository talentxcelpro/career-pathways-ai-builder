-- Fix RLS policy for career_passport_qr table to allow users to insert their own QR codes
CREATE POLICY "Users can create their own QR codes" 
ON public.career_passport_qr 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure users can update their own QR codes
CREATE POLICY "Users can update their own QR codes" 
ON public.career_passport_qr 
FOR UPDATE 
USING (auth.uid() = user_id);