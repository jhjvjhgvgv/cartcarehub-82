
import React from "react";
import { LoadingView } from "@/components/auth/LoadingView";
import { useInitialLoading } from "@/hooks/use-initial-loading";

export function InitialLoading() {
  const { loading, setLoading } = useInitialLoading();

  if (!loading) {
    return null;
  }

  return <LoadingView onLoadingComplete={() => setLoading(false)} />;
}
