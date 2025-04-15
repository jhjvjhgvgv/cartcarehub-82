
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Force clear cache on startup but don't block rendering
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

// Register service worker with immediate update check but don't block rendering
const updateSW = registerSW({
  immediate: true,
  onRegistered(registration) {
    console.log('Service worker registered');
    // Force update check
    if (registration) {
      setInterval(() => {
        registration.update().catch(console.error);
      }, 60000); // Check for updates every minute
    }
  },
  onNeedRefresh() {
    // Force update without asking when new content is available
    updateSW(true);
    // Also reload the page to ensure latest version
    window.location.reload();
  },
});

// Render the app first, then clear caches and manage service workers in background
const rootElement = document.getElementById("root");
if (rootElement) {
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2);
  rootElement.setAttribute('data-timestamp', String(timestamp));
  rootElement.setAttribute('data-random', randomValue);
  document.documentElement.dataset.appVersion = String(timestamp);
  
  // Render immediately
  createRoot(rootElement).render(<App />);
  
  // Then perform cache clearing operations without blocking rendering
  clearAllCaches();
  
  // Unregister service workers in the background
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        // Don't wait for unregister to complete
        registration.unregister().catch(console.error);
        console.log('Service worker unregistered');
      }
    }).catch(console.error);
  }
}
