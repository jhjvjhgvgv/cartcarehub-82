
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Clear caches on startup but don't block rendering
const clearAllCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared successfully');
    } catch (err) {
      console.error('Failed to clear caches:', err);
    }
  }
};

// Register service worker with update check but don't block rendering
const updateSW = registerSW({
  immediate: true,
  onRegistered(registration) {
    console.log('Service worker registered');
    // Check for updates periodically
    if (registration) {
      setInterval(() => {
        registration.update().catch(console.error);
      }, 60000); // Check for updates every minute
    }
  },
  onNeedRefresh() {
    // Update service worker without forcing page reload
    updateSW();
  },
});

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  // Set basic cache-busting attributes - less aggressive
  rootElement.setAttribute('data-timestamp', String(Date.now()));
  
  // Render immediately
  createRoot(rootElement).render(<App />);
  
  // Clear caches in the background without blocking rendering
  clearAllCaches();
}
