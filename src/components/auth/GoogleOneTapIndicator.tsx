import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Zap } from 'lucide-react';

interface GoogleOneTapIndicatorProps {
  isActive?: boolean;
}

export const GoogleOneTapIndicator: React.FC<GoogleOneTapIndicatorProps> = ({ 
  isActive = false 
}) => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success'>('loading');

  useEffect(() => {
    if (isActive) {
      setShowIndicator(true);
      setStatus('loading');
      
      // Check if Google SDK is loaded
      const checkGoogleReady = () => {
        if (window.google?.accounts?.id) {
          setStatus('ready');
          // Auto-hide after 3 seconds
          setTimeout(() => setShowIndicator(false), 3000);
        } else {
          setTimeout(checkGoogleReady, 100);
        }
      };
      
      checkGoogleReady();
    }
  }, [isActive]);

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          {status === 'loading' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Preparing Google Sign-in...
              </span>
            </>
          )}
          
          {status === 'ready' && (
            <>
              <div className="relative">
                <Zap className="w-4 h-4 text-green-500" />
                <motion.div
                  className="absolute inset-0 bg-green-500/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                Fast Google Sign-in Ready
              </span>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                Signed in successfully!
              </span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};