import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormHeader } from "./components/FormHeader";
import { EmailField } from "./components/EmailField";
import { PasswordFields } from "./components/PasswordFields";
import { FormActions } from "./components/FormActions";
import { AuthFormProvider, useAuthForm } from "./context/AuthFormContext";
import { UserRole } from "./context/types";

interface AuthFormProps {
  selectedRole: UserRole | null;
  onBack: () => void;
}

interface AuthFormContentProps {
  onBack: () => void;
}

const AuthFormContent = ({ onBack }: AuthFormContentProps) => {
  const { handleAuth, selectedRole, isSignUp } = useAuthForm();
  
  return (
    <Card className="w-full bg-white rounded-2xl shadow-xl border-none overflow-hidden">
      <FormHeader 
        title={isSignUp ? `Sign Up - ${selectedRole}` : `Welcome Back`}
        onBack={onBack}
      />
      <CardContent className="p-6 pt-8">
        <form onSubmit={handleAuth} className="space-y-5">
          <EmailField />
          <PasswordFields />
          <FormActions />
        </form>
      </CardContent>
    </Card>
  );
};

export const AuthForm = ({ selectedRole, onBack }: AuthFormProps) => {
  return (
    <AuthFormProvider selectedRole={selectedRole}>
      <AuthFormContent onBack={onBack} />
    </AuthFormProvider>
  );
};
