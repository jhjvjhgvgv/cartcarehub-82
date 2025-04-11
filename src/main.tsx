
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

// Register service worker with immediate update check
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    console.log('Service worker registered:', swUrl);
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

// Execute cache clearing
clearAllCaches().then(() => {
  // Add timestamp to prevent caching
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const timestamp = Date.now();
    rootElement.setAttribute('data-timestamp', String(timestamp));
    document.documentElement.dataset.appVersion = String(timestamp);
    createRoot(rootElement).render(<App />);
  }
});
