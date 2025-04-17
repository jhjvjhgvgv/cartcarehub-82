
import React from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface LoadingViewProps {
  onLoadingComplete: () => void;
}

export const LoadingView = ({ onLoadingComplete }: LoadingViewProps) => {
  return <LoadingScreen onLoadingComplete={onLoadingComplete} />;
};
