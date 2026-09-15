import React from 'react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { TalentXcelLogo } from '../brand/TalentXcelLogo';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthLoadingOverlay: React.FC = () => {
  const { loading, error, retryAuth } = useOptimizedAuth();

  return (
    <AnimatePresence>
      {(loading || error) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-black"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute -inset-8 bg-blue-500/20 rounded-full blur-3xl"
            />
            <TalentXcelLogo className="h-20 w-20 relative z-10" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col items-center"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">TalentXcel</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {error ? "Initialization failed" : "Initializing Core..."}
            </p>
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center"
            >
              <p className="text-xs text-red-500 mb-4 text-center max-w-xs">
                {error.message || "An unexpected error occurred during startup."}
              </p>
              <button
                onClick={retryAuth}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Retry Initialization
              </button>
            </motion.div>
          ) : (
            <div className="absolute bottom-12 w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ 
                  x: ["-100%", "100%"] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
