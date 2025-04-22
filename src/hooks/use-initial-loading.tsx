
import { useState, useEffect } from "react";

export function useInitialLoading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading delay - but only do it once per session
    if (!sessionStorage.getItem('initial_load_complete')) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('initial_load_complete', 'true');
      }, 1000);
  
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading };
}
