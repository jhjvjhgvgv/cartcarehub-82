
import { useState, useEffect } from 'react';
import { Button } from './button';
import { DownloadIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if the app is already installed
  useEffect(() => {
    // Check if the app is installed via matchMedia
    const checkIsInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Initial check
    checkIsInstalled();

    // Listen for display mode changes
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    // Capture the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
    });

    return () => {
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt as it can't be used again
    setInstallPrompt(null);
  };

  // Don't render anything if the app is already installed or if install isn't available
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstallClick} 
      className="flex items-center gap-2"
      variant="outline"
    >
      <DownloadIcon className="h-4 w-4" />
      Install App
    </Button>
  );
}
