-- Fix role for specific user who should be a maintenance account
update public.profiles
set role = 'maintenance', updated_at = now()
where email = 'electriccovecofee@gmail.com';