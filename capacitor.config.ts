import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.hamradio.examprep',
  appName: 'Ham Radio Canada',
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
