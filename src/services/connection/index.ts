
import { DatabaseConnectionService } from "./database-connection-service";
import { UserService as UserServiceImplementation } from "./user-service";

// Re-export combined service with all functionality from both services
export const ConnectionService = {
  ...DatabaseConnectionService,
  ...UserServiceImplementation
};
