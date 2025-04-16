
import React from "react";
import { Input } from "@/components/ui/input";
import { useAuthForm } from "../context/AuthFormContext";

export const EmailField = () => {
  const { email, setEmail, isLoading } = useAuthForm();

  return (
    <div className="space-y-3">
      <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
        Email Address
      </label>
      <Input
        id="email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-xl h-12"
        disabled={isLoading}
      />
    </div>
  );
};
