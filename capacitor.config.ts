import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.talentxcel.app',
  appName: 'TalentXcel Pro',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    CapacitorUpdater: {
      autoUpdate: false,   // Controlled manually via ota-updater.ts for atomic stability
      statsUrl: '',        // Disable external telemetry (self-hosted Supabase)
      channelUrl: '',      // Handled via Supabase Storage manifest
      updateUrl: '',       // Handled via dynamic code bundle fetching
      resetWhenUpdate: false,
      directUpdate: false
    }
  }
};

export default config;
