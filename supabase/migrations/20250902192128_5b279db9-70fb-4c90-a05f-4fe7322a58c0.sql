-- Fix role for the correct email address (with double f in coffee)
UPDATE public.profiles
SET role = 'maintenance', updated_at = now()
WHERE email = 'electriccovecoffee@gmail.com';