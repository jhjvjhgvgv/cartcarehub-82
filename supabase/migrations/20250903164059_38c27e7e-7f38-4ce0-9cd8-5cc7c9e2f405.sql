-- Update existing connection to use standardized store ID (company_name)
-- The store user has company_name = 'TestShop', so update the connection with store_id = 'shopmart.com'
UPDATE store_provider_connections 
SET store_id = 'TestShop'
WHERE store_id = 'shopmart.com';

-- Add debugging: Log store ID standardization
INSERT INTO system_logs (action, resource_type, resource_id, details)
VALUES (
  'store_id_standardization',
  'store_provider_connections', 
  'system',
  jsonb_build_object(
    'message', 'Standardized store IDs to use company_name as primary identifier',
    'updated_connections', 1,
    'timestamp', now()
  )
);