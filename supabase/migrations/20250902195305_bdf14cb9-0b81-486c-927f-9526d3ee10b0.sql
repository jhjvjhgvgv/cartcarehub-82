-- Create a test connection request from maintenance to store using the correct store ID
INSERT INTO store_provider_connections (
  store_id,
  provider_id,
  status,
  initiated_by,
  created_at,
  updated_at
) VALUES (
  'TestShop', -- Use the store's company name
  '1d580999-09b5-4495-9a82-097a2298f1c1', -- Maintenance provider ID
  'pending',
  '475dec58-41f8-4acd-9848-1cac6fd49520', -- Maintenance user ID
  now(),
  now()
);