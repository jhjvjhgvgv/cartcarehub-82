
import { supabase } from "@/integrations/supabase/client";
import { UserAccount } from "../connection/types";

export type AccountType = "store" | "maintenance";

// Default store account template
const DEFAULT_STORE_TEMPLATE = {
  name: "New Store",
  address: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  carts: 0,
  activeCarts: 0,
  maintenanceNeeded: 0
};

// Default maintenance provider template
const DEFAULT_MAINTENANCE_TEMPLATE = {
  name: "New Maintenance Provider",
  services: ["Basic Cart Repair"],
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  activeStores: 0,
  completedServices: 0
};

/**
 * Create a new account template based on account type
 */
export const createAccountTemplate = async (
  userId: string,
  accountType: AccountType,
  email: string
): Promise<boolean> => {
  try {
    console.log(`Creating ${accountType} account template for user: ${userId}`);
    
    // Generate a default account ID
    const accountId = crypto.randomUUID();
    
    if (accountType === "store") {
      // Create store account in localStorage for now
      // This would be replaced with Supabase database operations when fully integrated
      const storeAccount: UserAccount = {
        id: accountId,
        name: DEFAULT_STORE_TEMPLATE.name,
        type: "store"
      };
      
      localStorage.setItem(`store_account_${userId}`, JSON.stringify({
        ...DEFAULT_STORE_TEMPLATE,
        id: accountId,
        userId,
        email
      }));
      
      localStorage.setItem("currentUser", JSON.stringify(storeAccount));
      
      return true;
    } else {
      // Create maintenance provider account in localStorage for now
      // This would be replaced with Supabase database operations when fully integrated
      const maintenanceAccount: UserAccount = {
        id: accountId,
        name: DEFAULT_MAINTENANCE_TEMPLATE.name,
        type: "maintenance"
      };
      
      localStorage.setItem(`maintenance_account_${userId}`, JSON.stringify({
        ...DEFAULT_MAINTENANCE_TEMPLATE,
        id: accountId,
        userId,
        email
      }));
      
      localStorage.setItem("currentUser", JSON.stringify(maintenanceAccount));
      
      return true;
    }
  } catch (error) {
    console.error("Failed to create account template:", error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    return false;
  }
};

/**
 * Get account template based on user ID and account type
 */
export const getAccountTemplate = (
  userId: string,
  accountType: AccountType
): any => {
  try {
    const key = accountType === "store" 
      ? `store_account_${userId}` 
      : `maintenance_account_${userId}`;
      
    const accountData = localStorage.getItem(key);
    
    if (!accountData) {
      return accountType === "store" 
        ? DEFAULT_STORE_TEMPLATE 
        : DEFAULT_MAINTENANCE_TEMPLATE;
    }
    
    return JSON.parse(accountData);
  } catch (error) {
    console.error("Failed to get account template:", error);
    return accountType === "store" 
      ? DEFAULT_STORE_TEMPLATE 
      : DEFAULT_MAINTENANCE_TEMPLATE;
  }
};
