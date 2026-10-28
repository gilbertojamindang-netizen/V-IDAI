import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voidai.app',
  appName: 'VOID.AI',
  webDir: 'dist',
  // No `server.url` is set, so Capacitor loads the bundled dist/ files
  // straight from the device's local storage — the app works fully offline.
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
