// Connection Service - Uses Supabase database exclusively
// The localStorage-based connection-service.ts is deprecated

import { DatabaseConnectionService } from "./database-connection-service";

// Export the database-backed service as the primary ConnectionService
export const ConnectionService = DatabaseConnectionService;

// Re-export types
export * from "./types";
