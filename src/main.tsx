
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with immediate update check
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Force update without asking when new content is available
    updateSW(true);
  },
});

// Force clear cache on startup
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

// Add timestamp to prevent caching
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.setAttribute('data-timestamp', String(Date.now()));
  createRoot(rootElement).render(<App />);
}
