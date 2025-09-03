
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx'

// Configure service worker with automatic updates
const updateSW = registerSW({
  immediate: true, // Changed to true for immediate updates
  onRegistered(registration) {
    console.log('Service worker registered');
  },
  onNeedRefresh() {
    // Automatically apply the update
    updateSW(true);
    console.log('New content available, updating automatically');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegisterError(error) {
    console.error('SW registration error', error);
  }
});

// Store the update function globally
window.updateSW = () => {
  console.log("Manual update triggered");
  return updateSW(true);
}

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  );
}

