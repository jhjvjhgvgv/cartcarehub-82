
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
      }, 30000); // Check for updates every 30 seconds (reduced from 60s)
    }
  },
  onNeedRefresh() {
    // Force update without asking when new content is available
    updateSW();
    // Also reload the page to ensure latest version
    window.location.reload();
  },
});

// Render the app first, then clear caches and manage service workers in background
const rootElement = document.getElementById("root");
if (rootElement) {
  // Enhanced timestamp and randomization for more aggressive cache busting
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36).substring(2);
  
  // Set more aggressive cache-busting attributes
  rootElement.setAttribute('data-timestamp', String(timestamp));
  rootElement.setAttribute('data-random', randomValue);
  rootElement.setAttribute('data-version', `${timestamp}_${randomValue}`);
  document.documentElement.dataset.appVersion = String(timestamp);
  
  // Add a meta tag for cache busting
  const meta = document.createElement('meta');
  meta.name = 'app-cache-buster';
  meta.content = `${timestamp}_${randomValue}`;
  document.head.appendChild(meta);
  
  // Force a reload if this is a Lovable environment and we're loading from cache
  if (window.location.hostname.includes('lovable.app')) {
    // Check if we have a version in localStorage that's different from current
    const storedVersion = localStorage.getItem('app_version');
    const currentVersion = `${timestamp}_${randomValue}`;
    localStorage.setItem('app_version', currentVersion);
    
    if (storedVersion && storedVersion !== currentVersion) {
      console.log('Version changed in Lovable environment, forcing reload');
      window.location.reload();
    }
    
    // Also force reload after a short delay (for Lovable environment only)
    setTimeout(() => {
      console.log('Scheduled refresh for Lovable environment');
      window.location.reload();
    }, 5000); // 5 second delay to allow initial render
  }
  
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
