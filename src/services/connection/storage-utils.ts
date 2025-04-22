/**
 * Utilities to handle localStorage flags related to connection and onboarding.
 */

// Check if the current session is immediately after account creation (new account)
export function isNewAccountSession(): boolean {
  return localStorage.getItem("isNewAccountSession") === "true";
}

// Mark the session as a new account session (used after sign up)
export function setNewAccountSessionFlag(value: boolean) {
  if (value) {
    localStorage.setItem("isNewAccountSession", "true");
  } else {
    localStorage.removeItem("isNewAccountSession");
  }
}

// Other storage utils (existing) would go here if needed. For now, this file only manages the new flag.
