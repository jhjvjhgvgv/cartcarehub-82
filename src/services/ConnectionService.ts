
// This file is maintained for backward compatibility
// Import and re-export the new ConnectionService implementation
import { ConnectionService as NewConnectionService } from "./connection/index";

export const ConnectionService = NewConnectionService;
