
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.12dae9ab65c643a982e1bc2521fd2adf',
  appName: 'cartcarehub-82',
  webDir: 'dist',
  server: {
    url: 'https://12dae9ab-65c6-43a9-82e1-bc2521fd2adf.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
    },
  }
};

export default config;
