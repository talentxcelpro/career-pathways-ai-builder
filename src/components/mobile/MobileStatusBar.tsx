import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useBatteryOptimization } from '@/hooks/useBatteryOptimization';
import { Wifi, WifiOff, CloudOff, Battery, BatteryWarning, BatteryCharging } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileStatusBar() {
  const { isOnline, pendingCount, isSyncing, forceSync } = useOfflineSync();
  const { batteryStatus, isBatteryLow, isBatteryCritical, optimizations } = useBatteryOptimization();

  // Show status bar only when there are important notifications
  const showStatusBar = !isOnline || pendingCount > 0 || isBatteryLow;

  return (
    <AnimatePresence>
      {showStatusBar && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm"
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                
                {!isOnline && (
                  <span className="text-sm text-muted-foreground">Offline</span>
                )}

                {pendingCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CloudOff className="w-3 h-3" />
                    {pendingCount} pending
                  </Badge>
                )}

                {isSyncing && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </div>
                )}
              </div>

              {/* Battery Status */}
              {batteryStatus && (
                <div className="flex items-center gap-2">
                  {batteryStatus.charging ? (
                    <BatteryCharging className="w-4 h-4 text-green-500" />
                  ) : isBatteryCritical ? (
                    <BatteryWarning className="w-4 h-4 text-red-500" />
                  ) : isBatteryLow ? (
                    <Battery className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Battery className="w-4 h-4 text-foreground" />
                  )}
                  
                  <span className="text-sm">
                    {Math.round(batteryStatus.level * 100)}%
                  </span>

                  {optimizations.reduceAnimations && (
                    <Badge variant="outline" className="text-xs">
                      Power Saving
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions */}
              {pendingCount > 0 && isOnline && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={forceSync}
                  disabled={isSyncing}
                >
                  Sync Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
