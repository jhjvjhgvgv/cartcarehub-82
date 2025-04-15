
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Configure service worker with NO automatic refresh
const updateSW = registerSW({
  onRegistered(registration) {
    console.log('Service worker registered');
    // We won't set up automatic checking - this prevents refresh loops
    // User can manually refresh with the refresh button
  },
  onNeedRefresh() {
    // Don't auto-update, just log it
    console.log('New content available, refresh manually using the app refresh button');
  },
});

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
