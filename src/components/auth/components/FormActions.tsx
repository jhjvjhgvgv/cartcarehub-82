
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuthForm } from "../context/AuthFormContext";
import { SignUpMessage } from "./SignUpMessage";
import { Loader2 } from "lucide-react";

export const FormActions = () => {
  const { isSignUp, setIsSignUp, isLoading, setConfirmPassword } = useAuthForm();

  return (
    <>
      {isSignUp && <SignUpMessage />}

      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
        disabled={isLoading}
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
