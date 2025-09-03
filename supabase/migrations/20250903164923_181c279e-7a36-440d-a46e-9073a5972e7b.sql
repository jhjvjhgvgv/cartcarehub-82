-- Enable real-time updates for store_provider_connections table
ALTER TABLE store_provider_connections REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE store_provider_connections;