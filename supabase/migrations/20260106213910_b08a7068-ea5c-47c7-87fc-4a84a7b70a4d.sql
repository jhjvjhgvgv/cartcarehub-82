-- Delete all user-related data from public tables
-- Order matters due to foreign key constraints

-- First, delete data that references other tables
DELETE FROM audit_log;
DELETE FROM cart_status_events;
DELETE FROM inspections;
DELETE FROM issues;
DELETE FROM work_orders;
DELETE FROM store_daily_rollups;
DELETE FROM carts;
DELETE FROM provider_store_links;
DELETE FROM invitations;
DELETE FROM org_memberships;
DELETE FROM user_profiles;
DELETE FROM organizations;