import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

// We dynamically access or type CapacitorUpdater so it runs safely even if the native plugin is stubbed or during web preview
export interface OtaManifest {
  version: string;
  url: string;
  checksum?: string;
  notes?: string;
  minNativeVersion?: string;
}

export interface OtaUpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  isReadyToRestart: boolean;
  currentVersion: string;
  newVersion: string | null;
  downloadProgress: number; // 0 to 100
  error: string | null;
}

// In-memory update state store for reactive subscribers
let currentStatus: OtaUpdateStatus = {
  isChecking: false,
  isDownloading: false,
  isUpdateAvailable: false,
  isReadyToRestart: false,
  currentVersion: '1.0.0',
  newVersion: null,
  downloadProgress: 0,
  error: null,
};

const listeners = new Set<(status: OtaUpdateStatus) => void>();

function notifySubscribers() {
  listeners.forEach((listener) => listener({ ...currentStatus }));
}

function updateState(partial: Partial<OtaUpdateStatus>) {
  currentStatus = { ...currentStatus, ...partial };
  notifySubscribers();
}

/**
 * Dynamically retrieves @capgo/capacitor-updater plugin if installed,
 * falling back gracefully if running in web/mock environments.
 */
async function getCapacitorUpdater() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }
  try {
    const mod = await import('@capgo/capacitor-updater');
    return mod.CapacitorUpdater;
  } catch (err) {
    console.info('[OTA] @capgo/capacitor-updater not installed or registered yet. Operating in fallback mode.');
    return null;
  }
}

/**
 * Initializes the OTA Updater system.
 * Must be called as early as possible inside NativeApp root.
 * Calls notifyAppReady() to signal the native shell that the latest bundle booted successfully (prevents automatic rollback).
 */
export async function initOtaUpdater(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const updater = await getCapacitorUpdater();
  if (!updater) return;

  try {
    // 1. CRITICAL: Acknowledge that the bundle booted cleanly.
    // If this is not called within 10-30s of launch, CapacitorUpdater assumes the update crashed and rolls back.
    await updater.notifyAppReady();
    console.log('[OTA] App ready acknowledged to native container');

    const current = await updater.current();
    if (current?.bundle?.version) {
      updateState({ currentVersion: current.bundle.version });
    }

    // 2. Listen to download progress
    updater.addListener('download', (info: { percent: number }) => {
      updateState({ downloadProgress: Math.round(info.percent) });
    });

    // 3. Trigger background update check
    await checkForUpdates();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[OTA] Updater initialization warning:', message);
  }
}

/**
 * Checks the Supabase Storage / manifest endpoint for a newer bundle.
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (import.meta.env.VITE_OTA_DISABLED === 'true') {
    console.log('[OTA] Update check skipped (VITE_OTA_DISABLED=true)');
    return false;
  }

  const updater = await getCapacitorUpdater();
  if (!updater) return false;

  updateState({ isChecking: true, error: null });

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('[OTA] VITE_SUPABASE_URL not configured. OTA check aborted.');
      updateState({ isChecking: false });
      return false;
    }

    // Direct manifest fetch from Supabase public storage bucket "ota-bundles"
    const manifestUrl = `${supabaseUrl}/storage/v1/object/public/ota-bundles/manifest.json?t=${Date.now()}`;
    const response = await fetch(manifestUrl, { cache: 'no-store' });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[OTA] No remote manifest.json found in ota-bundles storage yet.');
      } else {
        console.warn(`[OTA] Manifest fetch returned HTTP ${response.status}`);
      }
      updateState({ isChecking: false });
      return false;
    }

    const manifest: OtaManifest = await response.json();
    const current = await updater.current();
    const activeVersion = current?.bundle?.version || currentStatus.currentVersion;

    console.log(`[OTA] Active version: ${activeVersion} | Remote version: ${manifest.version}`);

    if (manifest.version && manifest.version !== activeVersion) {
      updateState({
        isChecking: false,
        isUpdateAvailable: true,
        newVersion: manifest.version,
        isDownloading: true,
      });

      console.log(`[OTA] Downloading live bundle v${manifest.version} in background...`);
      const bundle = await updater.download({
        url: manifest.url,
        version: manifest.version,
        checksum: manifest.checksum,
      });

      await updater.set(bundle);

      updateState({
        isDownloading: false,
        isReadyToRestart: true,
        downloadProgress: 100,
      });

      console.log(`[OTA] Live bundle v${manifest.version} staged successfully. Ready on reload.`);
      return true;
    }

    updateState({ isChecking: false, isUpdateAvailable: false });
    return false;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[OTA] Error checking for updates:', message);
    updateState({
      isChecking: false,
      isDownloading: false,
      error: message,
    });
    return false;
  }
}

/**
 * Triggers a hot-swap reload to apply the downloaded bundle immediately.
 */
export async function applyOtaUpdateAndReload(): Promise<void> {
  const updater = await getCapacitorUpdater();
  if (updater) {
    try {
      await updater.reload();
      return;
    } catch (e) {
      console.warn('[OTA] Native updater.reload() failed, falling back to window.location.reload()', e);
    }
  }
  window.location.reload();
}

/**
 * React hook to subscribe to OTA update progress and events.
 */
export function useOtaStatus(): OtaUpdateStatus & {
  checkForUpdates: () => Promise<boolean>;
  applyUpdate: () => Promise<void>;
} {
  const [status, setStatus] = useState<OtaUpdateStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
    listeners.add(setStatus);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);

  return {
    ...status,
    checkForUpdates,
    applyUpdate: applyOtaUpdateAndReload,
  };
}
