
import { UserAccount, StoreAccount, MaintenanceAccount } from "./types";
import { 
  initializeStoreAccounts, 
  initializeMaintenanceAccounts,
  createUserAccountIfNeeded
} from "./storage-utils";

// Initialize accounts - will be empty for new users
const storeAccounts = initializeStoreAccounts();
const maintenanceAccounts = initializeMaintenanceAccounts();

// Initialize current user - will be empty for new users
const currentUser = createUserAccountIfNeeded();

export const UserService = {
  // Get current user
  getCurrentUser() {
    return currentUser;
  },
  
  // Get user role (store or maintenance)
  getUserRole() {
    return currentUser.type;
  },
  
  // Get current user ID
  getCurrentUserId() {
    return currentUser.id;
  },
  
  // Check if current user is a maintenance provider
  isMaintenanceUser() {
    return currentUser.type === "maintenance";
  },
  
  // Get all stores
  getStores() {
    return storeAccounts;
  },
  
  // Get all maintenance providers
  getMaintenanceProviders() {
    return maintenanceAccounts;
  },
  
  // Get store by ID
  getStoreById(id: string) {
    return storeAccounts.find(store => store.id === id);
  },
  
  // Get maintenance provider by ID
  getMaintenanceById(id: string) {
    return maintenanceAccounts.find(provider => provider.id === id);
  }
};
