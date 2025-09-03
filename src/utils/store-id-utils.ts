// Utility for consistent store ID generation across the application
import { Profile } from "@/types/profile";

/**
 * Generates a consistent store ID from a user profile
 * Priority: company_name > email domain > fallback with user ID
 */
export function generateStoreId(profile: Profile | null | undefined): string {
  if (!profile) {
    return "unknown-store";
  }

  // Priority 1: Use company_name if available and not empty
  if (profile.company_name && profile.company_name.trim()) {
    return profile.company_name.trim();
  }

  // Priority 2: Use email domain
  if (profile.email && profile.email.includes('@')) {
    const domain = profile.email.split('@')[1];
    if (domain) {
      return domain;
    }
  }

  // Priority 3: Fallback to store-{userId}
  return `store-${profile.id}`;
}

/**
 * Gets the store identifier for display purposes
 * Shows company name with fallback to email or ID
 */
export function getStoreDisplayName(profile: Profile | null | undefined): string {
  if (!profile) {
    return "Unknown Store";
  }

  return profile.company_name || 
         profile.display_name || 
         profile.email || 
         `Store ${profile.id.slice(0, 8)}`;
}