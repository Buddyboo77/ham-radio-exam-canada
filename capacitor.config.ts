import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.hamradioexam.canada',
  appName: 'Ham Radio Exam Canada',
  webDir: 'dist/public',
  server: {
   url: 'https://signal-ace-canada.replit.app',
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
