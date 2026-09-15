import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';

import { registerServiceWorker, unregisterServiceWorker } from './utils/serviceWorkerRegistration';
import { initCriticalPerformance } from './utils/criticalPerformance';
import { VoicePlayerProvider } from './voice/VoicePlayerContext';

import './index.css';

initCriticalPerformance();

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const isNative =
  Capacitor.isNativePlatform() ||
  window.location.hostname === 'talentxcel.local' ||
  /\bwv\b|Capacitor/i.test(navigator.userAgent);
const root = createRoot(container);
let bootErrorRendered = false;

const bootFallback = (
  <div className="min-h-screen bg-white flex items-center justify-center text-slate-900">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-slate-500">Loading TalentXcel</p>
    </div>
  </div>
);

function renderBootError(error: unknown) {
  if (bootErrorRendered) return;
  bootErrorRendered = true;

  const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown boot error';
  console.error('[Boot] TalentXcel failed to initialize:', error);

  root.render(
    <div className="min-h-screen bg-white flex items-center justify-center px-6 text-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-bold text-amber-700">
          !
        </div>
        <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight">TalentXcel needs a restart</h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          We hit a startup issue while loading the native shell. Restart the app once and it should recover.
        </p>
        <pre className="mt-4 max-h-40 overflow-auto rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
          {message}
        </pre>
      </div>
    </div>
  );
}

function installGlobalBootGuards() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    if (event.error) {
      renderBootError(event.error);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    renderBootError(event.reason);
  });
}

async function bootApplication() {
  try {
    installGlobalBootGuards();

    root.render(bootFallback);
    document.getElementById('boot-splash')?.remove();

    const { default: RootApp } = isNative
      ? await import('./NativeApp')
      : await import('./App');

    root.render(
      <React.StrictMode>
        <VoicePlayerProvider>
          <RootApp />
        </VoicePlayerProvider>
      </React.StrictMode>
    );

    console.log(`[Boot] Starting TalentXcel (${isNative ? 'native' : 'web'})`);

    if (isNative) {
      console.log('[Boot] Clearing any stale service workers and caches for native runtime');
      void Promise.race([
        unregisterServiceWorker(),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ]).catch((error) => {
        console.warn('[Boot] Native cache cleanup skipped:', error);
      });
    }

    if (!isNative) {
      registerServiceWorker();
    }
  } catch (error) {
    renderBootError(error);
  }
}

bootApplication();
