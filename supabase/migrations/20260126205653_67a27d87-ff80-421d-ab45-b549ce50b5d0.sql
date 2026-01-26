-- Create corporation organization for platform administration
INSERT INTO public.organizations (id, name, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'Cart Care Hub Platform', 'corporation')
ON CONFLICT (id) DO NOTHING;

-- Grant corp_admin role to an existing user (using solvionllc@gmail.com as the admin)
INSERT INTO public.org_memberships (user_id, org_id, role)
VALUES ('d4599261-fe34-478b-b4ea-581945da64a2', '00000000-0000-0000-0000-000000000001', 'corp_admin')
ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'corp_admin';