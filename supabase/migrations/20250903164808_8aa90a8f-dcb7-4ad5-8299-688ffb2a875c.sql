-- First delete the duplicate connection and keep only one standardized
DELETE FROM store_provider_connections 
WHERE store_id = 'shopmart.com';

-- Update the remaining connection to ensure proper status
UPDATE store_provider_connections 
SET status = 'pending', updated_at = now()
WHERE store_id = 'TestShop' AND provider_id = '1d580999-09b5-4495-9a82-097a2298f1c1';