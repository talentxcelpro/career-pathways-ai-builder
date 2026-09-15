import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTalentScore } from '@/hooks/useTalentScore';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useTXCMining } from '@/hooks/useTXCMining';
import { Wifi, Zap, Trophy, Coins, Activity, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const TalentXcelPerformanceBar: React.FC = () => {
  const { talentScore, isLoading: scoreLoading } = useTalentScore();
  const { isOnline } = useOfflineSync();
  const { stats: txcStats } = useTXCMining();

  const score = talentScore?.score || 0;
  const band = talentScore?.band || 'Building';
  
  // Calculate "Identity Strength" based on score
  const signalBars = Math.ceil((score / 1000) * 4);

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none flex justify-center pt-2 px-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto h-10 px-4 flex items-center gap-6 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          {/* Identity Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3, 4].map((bar) => (
                    <div 
                      key={bar}
                      className={`w-1 rounded-full transition-all duration-500 ${
                        bar <= signalBars 
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                          : 'bg-white/10'
                      }`}
                      style={{ height: `${bar * 25}%` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-apple-bold text-slate-300 uppercase tracking-tight">Rank: {band}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Your market identity strength based on profile readiness.</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10" />

          {/* TalentScore */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-apple-heavy text-white">{score}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Performance Index: Your professional performance benchmark.</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10" />

          {/* TXC Balance */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-apple-heavy text-white">
                  {txcStats?.total_mined ? Math.floor(txcStats.total_mined).toLocaleString() : '0'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">TXC Balance: Performance tokens earned.</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10" />

          {/* Online/Activity Pulse */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className={`w-3.5 h-3.5 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              {isOnline && (
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};
