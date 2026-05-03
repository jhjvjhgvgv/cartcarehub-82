/**
 * Storage utilities — POST-CLEANUP.
 *
 * Canonical source of truth = Supabase session + DB (organizations,
 * org_memberships, provider_store_links, get_my_portal_context RPC).
 *
 * localStorage is now ONLY used for transient UI prefs. All previously cached
 * "ghost account" keys are aggressively purged on auth state changes.
 */

import { UserAccount, StoreAccount, MaintenanceAccount, StoreConnection } from "./types";

// Keys that must NEVER survive an auth state change.
const STALE_AUTH_KEYS = [
  "currentUser",
  "storeConnections",
  "storeAccounts",
  "maintenanceAccounts",
  "isNewAccountSession",
  "lastOperation",
] as const;

/**
 * Nuclear purge — wipe every cached client-side identity/connection key.
 * Called on SIGNED_OUT and USER_UPDATED.
 */
export function purgeLocalAuthState(): void {
  try {
    STALE_AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
    // Belt-and-braces: drop legacy supabase token shapes too.
    localStorage.removeItem("supabase.auth.token");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
      .forEach((k) => localStorage.removeItem(k));
    console.log("🧨 purgeLocalAuthState: cleared", STALE_AUTH_KEYS);
  } catch (e) {
    console.warn("purgeLocalAuthState failed", e);
  }
}

// ---------------------------------------------------------------------------
// Legacy shims — kept only so existing imports compile. They now ALWAYS return
// empty values, because the canonical data lives in Supabase. Do not extend.
// ---------------------------------------------------------------------------

export function isNewAccountSession(): boolean {
  return false;
}

export function setNewAccountSessionFlag(_value: boolean) {
  // no-op: replaced by Supabase session + user_onboarding table
}

export function getStoredConnections(): StoreConnection[] {
  return [];
}

export function initializeStoreAccounts(): StoreAccount[] {
  return [];
}

export function initializeMaintenanceAccounts(): MaintenanceAccount[] {
  return [];
}

export function createUserAccountIfNeeded(): UserAccount {
  return { id: "", name: "", type: "store" };
}

export function clearNewAccountFlags(_immediate = false) {
  purgeLocalAuthState();
}

export function clearFlagsOnSettingsNavigation(): void {
  purgeLocalAuthState();
}
