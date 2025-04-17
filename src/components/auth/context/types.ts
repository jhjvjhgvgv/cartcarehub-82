
import { Dispatch, SetStateAction } from "react";

export type UserRole = "maintenance" | "store";

export interface AuthFormState {
  isSignUp: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  isLoading: boolean;
}

export interface AuthFormActions {
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  resetForm: () => void;
  handleAuth: (e: React.FormEvent) => Promise<void>;
}

export interface AuthFormContextType extends AuthFormState, AuthFormActions {
  selectedRole: UserRole | null;
}
