import React, { useEffect, useState } from 'react';
import { type TalentBeaconMatch, useReverseJobMatch } from '@/hooks/useReverseJobMatch';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MapPin, Building2, Briefcase, Zap, CheckCircle2, DollarSign, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TalentBeacon() {
  const { matches, isLoading, isScanning, startBeaconScan } = useReverseJobMatch();
  const { user } = useAuth();
  const [beaconActive, setBeaconActive] = useState(true);
  const [signaledJobIds, setSignaledJobIds] = useState<Set<string>>(new Set());
  const [signalingJobId, setSignalingJobId] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingSignals = async () => {
      if (!user?.id || !matches?.length) return;

      const jobIds = matches.map((match) => match.job_id);
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('user_id', user.id)
        .in('job_id', jobIds);

      if (error) {
        console.error('Failed to load TalentXcel Beacon signals:', error);
        return;
      }

      setSignaledJobIds(new Set((data || []).map((application) => application.job_id).filter(Boolean) as string[]));
    };

    loadExistingSignals();
  }, [matches, user?.id]);

  const handleExpressInterest = async (match: TalentBeaconMatch) => {
    if (!user?.id) {
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (signaledJobIds.has(match.job_id)) {
      toast.info('You already shared interest for this role.');
      return;
    }

    setSignalingJobId(match.job_id);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: match.job_id,
          status: 'applied',
          ai_match_score: match.match_score / 100,
          applied_at: now,
          last_activity_at: now,
          application_data: {
            source: 'talent_xcel_beacon_performance',
            company: match.jobs?.company,
            job_title: match.jobs?.title,
            match_score: match.match_score,
            matching_factors: match.matching_factors,
            skill_gaps: match.skill_gaps,
          },
        });

      if (error) {
        if (error.code === '23505') {
          setSignaledJobIds(prev => new Set([...prev, match.job_id]));
          toast.info('You already shared interest for this role.');
          return;
        }
        throw error;
      }

      setSignaledJobIds(prev => new Set([...prev, match.job_id]));
      toast.success(`Performance interest shared with ${match.jobs?.company || 'the employer'}. They can now review your profile.`);
    } catch (error) {
      console.error('Failed to share TalentXcel Beacon interest:', error);
      toast.error('Could not share interest. Please try again.');
    } finally {
      setSignalingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 edge-to-edge">
      {/* Header section with radar animation */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-16 pb-20 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        {/* Radar concentric circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20">
          <div className="absolute inset-0 rounded-full border border-blue-400/50 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-16 rounded-full border border-blue-400/50 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          <div className="absolute inset-32 rounded-full border border-blue-400/50 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl cursor-pointer transition-all duration-500 ${beaconActive ? 'bg-blue-600 shadow-blue-500/40' : 'bg-slate-800'}`}
            onClick={() => setBeaconActive(!beaconActive)}
          >
            <Radio className={`w-12 h-12 text-white ${beaconActive ? 'animate-pulse' : ''}`} />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-apple-heavy mb-4 tracking-tighter flex items-center gap-3 !text-white">
            TalentXcel Beacon <Sparkles className="w-8 h-8 !text-blue-400 animate-spin" />
          </h1>
          <p className="!text-slate-300 text-lg md:text-xl font-apple-medium max-w-xl leading-relaxed">
            {beaconActive 
              ? "Your Intelligence Beacon is active. Surfacing high-performance opportunities matching your professional identity." 
              : "Beacon paused. Proactive employer synchronization is temporarily offline."}
          </p>

          <AnimatePresence>
            {beaconActive && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-10 flex flex-col items-center gap-6"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-apple-heavy tracking-widest uppercase !text-white">
                    {matches?.length || 0} PARTNERS INDEXED YOUR PROFILE
                  </span>
                </div>

                <Button 
                  onClick={startBeaconScan}
                  disabled={isScanning}
                  className="h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-50 font-apple-heavy flex items-center gap-4 text-lg shadow-2xl transition-all hover:scale-105"
                >
                  <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Syncing Market...' : 'Initiate Deep Intelligence Scan'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match Cards Container */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20 space-y-6">
        {isLoading ? (
          // Skeletons
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 h-64 flex flex-col animate-pulse">
              <div className="w-full h-full bg-slate-50 rounded-2xl" />
            </div>
          ))
        ) : !beaconActive ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-2xl border border-slate-100 mt-12">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Radio className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-apple-heavy text-slate-900 mb-4 tracking-tight">Beacon Offline</h3>
            <p className="text-slate-500 font-apple-medium text-lg mb-10 max-w-sm mx-auto leading-relaxed">Activate your TalentXcel Beacon to synchronize with premium employers looking for your expertise.</p>
            <Button onClick={() => setBeaconActive(true)} className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-apple-heavy text-lg shadow-xl shadow-blue-500/20">
              Activate Intelligence Sync
            </Button>
          </div>
        ) : matches?.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-2xl border border-slate-100 mt-12">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
              <Zap className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-apple-heavy text-slate-900 mb-4 tracking-tight">Intelligence Map Empty</h3>
            <p className="text-slate-500 font-apple-medium text-lg mb-10 max-w-sm mx-auto leading-relaxed">Start a deep market scan to find your first TalentXcel Precision Match opportunities.</p>
            <Button 
              onClick={startBeaconScan} 
              disabled={isScanning}
              className="h-16 px-12 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-apple-heavy text-lg shadow-2xl"
            >
              {isScanning ? 'Syncing...' : 'Start Global Sync'}
            </Button>
          </div>
        ) : (
          matches?.map((match, idx) => (
            <motion.div 
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="bg-white border border-slate-100 p-10 rounded-[40px] shadow-2xl hover:shadow-blue-500/5 transition-all group"
            >
              {/* Score Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-2xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  <span className="text-lg font-apple-heavy text-emerald-700">{match.match_score}% Precision Match</span>
                </div>
                <Badge className="bg-slate-950 text-white border-0 px-4 py-1.5 rounded-xl text-[10px] font-apple-heavy uppercase tracking-widest">
                  Strategic Move
                </Badge>
              </div>

              {/* Job Info */}
              <div className="mb-8">
                <h3 className="text-3xl md:text-4xl font-apple-heavy text-slate-950 mb-2 tracking-tighter leading-none">
                  {match.jobs?.title}
                </h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <span className="font-apple-heavy text-xl">{match.jobs?.company}</span>
                </div>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                {match.jobs?.location && (
                  <div className="flex items-center gap-2 text-sm font-apple-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-blue-500" /> {match.jobs.location}
                  </div>
                )}
                {match.jobs?.employment_type && (
                  <div className="flex items-center gap-2 text-sm font-apple-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <Briefcase className="w-4 h-4 text-blue-500" /> {match.jobs.employment_type}
                  </div>
                )}
                {match.jobs?.salary_range && (
                  <div className="flex items-center gap-2 text-sm font-apple-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> {match.jobs.salary_range}
                  </div>
                )}
              </div>

              {/* Intelligence Rationale */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[32px] p-8 mb-8 border border-slate-100">
                <p className="text-[11px] font-apple-heavy text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Performance Rationale
                </p>
                <ul className="space-y-4">
                  {Array.isArray(match.matching_factors) && match.matching_factors.map((factor: string, i: number) => (
                    <li key={i} className="flex items-start gap-4 text-base font-apple-medium text-slate-700 leading-snug">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
                
                {match.skill_gaps && Array.isArray(match.skill_gaps) && match.skill_gaps.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-[11px] font-apple-heavy text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Recommended Skill Indexing
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {match.skill_gaps.slice(0, 3).map((skill: string, i: number) => (
                        <span key={i} className="text-[11px] font-apple-heavy bg-white text-slate-600 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                          {skill.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <Button
                onClick={() => handleExpressInterest(match)}
                disabled={signalingJobId === match.job_id || signaledJobIds.has(match.job_id)}
                className="w-full h-18 rounded-[24px] bg-slate-950 hover:bg-slate-900 text-white font-apple-heavy text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:bg-emerald-600 disabled:opacity-100"
              >
                {signaledJobIds.has(match.job_id) ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 mr-3 text-white" />
                    PERFORMANCE INTEREST SHARED
                  </>
                ) : signalingJobId === match.job_id ? (
                  'Synchronizing Interest...'
                ) : (
                  'Share Performance Interest'
                )}
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
