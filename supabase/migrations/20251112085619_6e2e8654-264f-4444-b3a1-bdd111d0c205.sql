-- Create default master admin account
INSERT INTO public.admin_accounts (
  username,
  email,
  password_hash,
  display_name,
  permissions,
  is_active
) VALUES (
  'masteradmin',
  'admin@cartcarehub.com',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  'Master Administrator',
  '["super_admin", "user_management", "system_config", "analytics"]'::jsonb,
  true
) ON CONFLICT (username) DO NOTHING;

-- Log the admin account creation
INSERT INTO public.system_logs (
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  'admin_account_created',
  'admin_account',
  (SELECT id::text FROM public.admin_accounts WHERE username = 'masteradmin'),
  jsonb_build_object(
    'username', 'masteradmin',
    'permissions', '["super_admin", "user_management", "system_config", "analytics"]',
    'created_via', 'migration'
  )
);