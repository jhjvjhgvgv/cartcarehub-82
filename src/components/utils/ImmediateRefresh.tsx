import { clearAllAppData } from "@/utils/app-refresh";

// Trigger immediate refresh when this component mounts
export const ImmediateRefresh = () => {
  // Clear all data immediately
  clearAllAppData();
  
  // Force page reload for completely fresh state
  setTimeout(() => {
    window.location.href = '/';
  }, 100);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg border shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Refreshing app...</span>
        </div>
      </div>
    </div>
  );
};

// Auto-execute refresh
clearAllAppData();
console.log("🔄 App refresh triggered - reloading...");
setTimeout(() => {
  window.location.href = '/';
}, 500);