
import React from "react";

export const SignUpMessage = () => {
  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
      <p className="font-medium">Note:</p>
      <p>When you sign up, a default account template will be created for you based on your role selection (Store or Maintenance Provider).</p>
      <p className="mt-2">If you're unable to sign up, signups may be disabled in this application. Please contact the administrator.</p>
    </div>
  );
};
