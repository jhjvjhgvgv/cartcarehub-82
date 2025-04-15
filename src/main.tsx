
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Track if we've already shown update notification to prevent multiple messages
let updateNotificationShown = false;

// Configure service worker with manual refresh only
const updateSW = registerSW({
  immediate: false,
  onRegistered(registration) {
    console.log('Service worker registered');
    
    // Check for updates only once per session
    if (registration && !sessionStorage.getItem('sw_update_checked')) {
      sessionStorage.setItem('sw_update_checked', 'true');
      console.log('Will check for SW updates once');
    }
  },
  onNeedRefresh() {
    // Prevent multiple notifications
    if (!updateNotificationShown) {
      updateNotificationShown = true;
      console.log('New content available, refresh manually using the app refresh button');
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegisterError(error) {
    console.error('SW registration error', error);
  }
});

// Store the update function globally with correct Promise<void> return type
window.updateSW = () => {
  console.log("Manual update triggered");
  return updateSW(true);
}

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
