
import React from "react";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
}

export const FormHeader = ({ title, onBack }: FormHeaderProps) => {
  return (
    <div className="bg-primary-600 pt-8 pb-12 px-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-white hover:text-primary-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary-500 rounded-tl-full -z-10" />
    </div>
  );
};
