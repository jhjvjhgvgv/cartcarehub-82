
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Force clear cache on startup - more aggressive approach
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

// Attempt to unregister existing service workers
const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
    } catch (err) {
      console.error('Failed to unregister service workers:', err);
    }
  }
};

// Register service worker with immediate update check
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

// Execute cache clearing and service worker management
Promise.all([
  clearAllCaches(),
  unregisterServiceWorkers()
]).then(() => {
  // Add multiple random query parameters to prevent caching
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2);
    rootElement.setAttribute('data-timestamp', String(timestamp));
    rootElement.setAttribute('data-random', randomValue);
    document.documentElement.dataset.appVersion = String(timestamp);
    createRoot(rootElement).render(<App />);
  }
});
