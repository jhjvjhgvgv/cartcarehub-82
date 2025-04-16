
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuthForm } from "../context/AuthFormContext";
import { SignUpMessage } from "./SignUpMessage";

export const FormActions = () => {
  const { isSignUp, setIsSignUp, isLoading, handleAuth, setConfirmPassword } = useAuthForm();

  return (
    <>
      {isSignUp && <SignUpMessage />}

      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Log In")}
      </Button>
      
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
