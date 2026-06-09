import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:    'cm.eatsy.app',
  appName:  'EATSY',
  webDir:   'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor:    '#0d0d0b',
      showSpinner:        false,
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#0d0d0b',
    },
  },
};

export default config;
