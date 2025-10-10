import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.signalace.examprep',
  appName: 'SignalAce Canada',
  webDir: 'dist/public',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
