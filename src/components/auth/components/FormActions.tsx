import React from "react";
import { Button } from "@/components/ui/button";
import { useAuthForm } from "../context/AuthFormContext";
import { SignUpMessage } from "./SignUpMessage";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { Loader2 } from "lucide-react";

export const FormActions = () => {
  const { 
    isSignUp, 
    setIsSignUp, 
    isLoading, 
    setConfirmPassword, 
    handleAuth 
  } = useAuthForm();

  return (
    <>
      {isSignUp && <SignUpMessage />}

      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
        disabled={isLoading}
        onClick={(e) => {
          // This is a backup in case the form's onSubmit doesn't fire
          if (e.currentTarget.form) {
            e.currentTarget.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }}
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Please wait...
          </span>
        ) : (
          isSignUp ? "Sign Up" : "Log In"
        )}
      </Button>

      <SocialLoginButtons />
      
      <div className="text-center mt-4 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full text-gray-600"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setConfirmPassword("");
          }}
          disabled={isLoading}
        >
          {isSignUp 
            ? "Already have an account? Sign In" 
            : "Need an account? Sign Up"}
        </Button>
      </div>
    </>
  );
};
