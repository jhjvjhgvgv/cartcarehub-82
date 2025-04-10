
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.12dae9ab65c643a982e1bc2521fd2adf',
  appName: 'cartcarehub-82',
  webDir: 'dist',
  server: {
    url: 'https://cartrepairpros.com?forceHideBadge=true&t=' + Date.now(),
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
