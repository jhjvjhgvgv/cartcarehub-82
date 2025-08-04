
import { DatabaseConnectionService } from "./database-connection-service";
import { UserService as UserServiceImplementation } from "./user-service";

// Re-export combined service with database methods taking priority
export const ConnectionService = {
  ...UserServiceImplementation,
  ...DatabaseConnectionService // Database methods override user service methods where they conflict
};
