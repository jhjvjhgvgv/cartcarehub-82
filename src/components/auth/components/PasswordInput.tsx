
import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  disabled = false,
  showPassword,
  onTogglePassword,
}: PasswordInputProps) => {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={6}
        className="rounded-xl h-12 pr-10"
        disabled={disabled}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={onTogglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
