-- Update arsh.wani@gmail.com profile to employer status since they're now a team member
UPDATE public.profiles
SET is_employer = true,
    employer_status = 'approved',
    updated_at = now()
WHERE id = '0951f595-abd6-4463-9d8b-58a6d0548fc7';