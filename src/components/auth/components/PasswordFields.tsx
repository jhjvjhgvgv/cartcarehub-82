
import React from "react";
import { useAuthForm } from "../context/AuthFormContext";
import { PasswordInput } from "./PasswordInput";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PasswordFields = () => {
  const { 
    isSignUp, 
    password, 
    setPassword, 
    confirmPassword, 
    setConfirmPassword, 
    showPassword, 
    setShowPassword,
    isLoading
  } = useAuthForm();
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-3">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
          Password
        </label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        />
      </div>

      {isSignUp && (
        <div className="space-y-3">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          />
        </div>
      )}

      {!isSignUp && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            className="text-primary-600 hover:text-primary-800 p-0 h-auto text-sm"
            onClick={() => navigate("/forgot-password")}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
        </div>
      )}
    </>
  );
};
