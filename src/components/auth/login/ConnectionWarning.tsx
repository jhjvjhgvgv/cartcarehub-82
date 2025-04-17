
interface ConnectionWarningProps {
  supabaseReady: boolean;
}

export const ConnectionWarning = ({ supabaseReady }: ConnectionWarningProps) => {
  if (supabaseReady) {
    return null;
  }
  
  return (
    <div className="p-3 text-sm bg-yellow-500/20 text-yellow-200 rounded-md">
      Database connection issue detected. Some features may be unavailable.
    </div>
  );
};
