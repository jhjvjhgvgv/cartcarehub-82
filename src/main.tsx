
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with minimal refresh intervention
const updateSW = registerSW({
  onRegistered(registration) {
    console.log('Service worker registered');
    // Check for updates less frequently
    if (registration) {
      setInterval(() => {
        registration.update().catch(console.error);
      }, 7200000); // Check for updates every 2 hours
    }
  },
  onNeedRefresh() {
    // Don't auto-update, just log it
    console.log('New content available, please refresh manually');
  },
});

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
