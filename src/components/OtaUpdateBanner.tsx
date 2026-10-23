import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, ArrowUpCircle } from 'lucide-react';
import { useOtaStatus } from '@/lib/ota-updater';

export const OtaUpdateBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isDownloading, isReadyToRestart, newVersion, downloadProgress, applyUpdate } = useOtaStatus();

  // Only show on native platforms (Android / iOS)
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  // Show if either actively downloading or ready to swap
  const shouldShow = (isDownloading || isReadyToRestart) && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.aside
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          aria-label="App update available"
          className="fixed bottom-20 left-4 right-4 z-[9999] mx-auto max-w-md pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-blue-500/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                {isDownloading ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-100" />
                ) : (
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-wider uppercase text-blue-400">
                    {isDownloading ? 'OTA Sync' : 'Update Ready'}
                  </span>
                  {newVersion && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded-md border border-blue-400/20">
                      v{newVersion}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">
                  {isDownloading
                    ? `Downloading live bundle (${downloadProgress}%)...`
                    : 'Instant features & optimizations ready.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isReadyToRestart ? (
                <button
                  type="button"
                  onClick={() => applyUpdate()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  Restart
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
