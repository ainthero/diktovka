import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'diktovka',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    iosScheme: 'https',
    androidScheme: 'https'
  }
};

export default config;
