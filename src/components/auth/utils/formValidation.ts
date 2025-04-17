
import { validateEmail as baseValidateEmail, validatePassword as baseValidatePassword } from "../utils/validation";
import { UserRole } from "../context/types";

export const validateFormData = (
  email: string,
  password: string,
  confirmPassword: string | null,
  selectedRole: UserRole | null,
  isSignUp: boolean
): { isValid: boolean; errorMessage: string } => {
  if (!email || !password) {
    return {
      isValid: false,
      errorMessage: "Please fill in all fields"
    };
  }

  if (!baseValidateEmail(email)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid email address"
    };
  }

  if (!selectedRole) {
    return {
      isValid: false,
      errorMessage: "Please select a portal first"
    };
  }

  if (isSignUp) {
    if (!confirmPassword) {
      return {
        isValid: false,
        errorMessage: "Please confirm your password"
      };
    }

    if (password !== confirmPassword) {
      return {
        isValid: false,
        errorMessage: "Passwords do not match"
      };
    }

    const { isValid, message } = baseValidatePassword(password);
    if (!isValid) {
      return {
        isValid: false,
        errorMessage: message
      };
    }
  }

  return { isValid: true, errorMessage: "" };
};
