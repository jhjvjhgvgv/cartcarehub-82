-- Create a test maintenance user by updating an existing user's role
UPDATE profiles 
SET role = 'maintenance', 
    updated_at = now()
WHERE email = 'testagsjd@gmail.com';