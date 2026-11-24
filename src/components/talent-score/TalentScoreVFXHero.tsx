import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  ExternalLink,
  Brain,
  Briefcase,
  TrendingUp,
  Target,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export interface TalentScoreVFXHeroProps {
  score?: number;
  displayName?: string;
  title?: string;
  company?: string;
  industry?: string;
  rankOverride?: string;
  growthDeltaOverride?: string;
  syncFidelityOverride?: string;
  onDiscoverStrengths?: () => void;
  onGetInsights?: () => void;
  onUnlockOpportunities?: () => void;
  onBuildFuture?: () => void;
  onStatClick?: (stat: 'rank' | 'growth' | 'sync' | 'skills' | 'experience' | 'opportunities') => void;
  onMottoClick?: (word: 'LEARN' | 'GROW' | 'EARN' | 'ACHIEVE') => void;
  isCinematic?: boolean;
  onToggleCinematic?: (val: boolean) => void;
}

export const TalentScoreVFXHero: React.FC<TalentScoreVFXHeroProps> = ({
  score = 820,
  displayName = 'Global Professional',
  title = 'Executive Leadership',
  company = 'Global Enterprise Network',
  industry = 'Universal',
  rankOverride = '#853',
  growthDeltaOverride = '+66',
  syncFidelityOverride = '98%',
  onDiscoverStrengths,
  onGetInsights,
  onUnlockOpportunities,
  onBuildFuture,
  onStatClick,
  onMottoClick,
  isCinematic = true,
  onToggleCinematic,
}) => {
  const [immersiveMode, setImmersiveMode] = useState<boolean>(isCinematic);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Soft Web Audio Sci-Fi Synthesizer (Zero-Asset, Polite)
  const playPulseSound = (frequency = 520, duration = 0.25) => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Re-scan trigger
  const handleRecalibrate = () => {
    setIsScanning(true);
    playPulseSound(440, 0.4);
    toast.info('Recalibrating live telemetry against global benchmarks...');

    setTimeout(() => {
      setIsScanning(false);
      playPulseSound(880, 0.3);
      toast.success('Career telemetry verified across all industry standards.');
    }, 2200);
  };

  // Live Canvas Ambient Particle Motes System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 1280);
    let height = (canvas.height = canvas.offsetHeight || 720);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Motes pool
    const particles = Array.from({ length: 42 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.05,
      hue: Math.random() > 0.4 ? 188 : 210, // Cyan and electric blue
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(Date.now() * 0.002 + p.x) * 0.005;

        // Wrap around smoothly
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${Math.max(0.1, Math.min(0.85, p.opacity))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${p.hue}, 95%, 65%)`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#020717] overflow-hidden select-none">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-950/40 via-[#020717] to-black pointer-events-none" />

      {/* Main Responsive 16:9 Cinema Container */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div 
          className="relative w-full aspect-[16/9] max-h-[85vh] rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.2)] bg-black"
          style={{
            backgroundImage: `url('/assets/talentscore-vfx-cinematic.jpg')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* ===================================================================== */}
          {/* 1. REAL VIDEO-LIKE SCI-FI LOADING EFFECTS (TRANSPARENT VFX ENGINE)    */}
          {/* ===================================================================== */}

          {/* Canvas Cyber Particle Motes */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

          {/* Overhead Aperture Spotlight Cones (Volumetric Breathing Light) */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-gradient-to-b from-cyan-400/20 via-blue-600/5 to-transparent blur-2xl pointer-events-none z-10 animate-pulse" />

          {/* Animated Horizontal Laser Scan Beam Sweeping Vertically */}
          <motion.div
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_18px_#22d3ee] pointer-events-none z-20 opacity-80"
          />

          {/* Full Screen Initial Scan Wave on Calibration */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-cyan-500/10 pointer-events-none z-30 flex items-center justify-center backdrop-blur-[1px]"
              >
                <div className="text-center font-mono space-y-2">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto shadow-[0_0_30px_#22d3ee]" />
                  <p className="text-sm font-bold tracking-widest text-cyan-300 uppercase">
                    CALIBRATING CAREER TELEMETRY...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glowing Expanding Radar Wave from Globe Center */}
          <div className="absolute top-[43%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-400/40 pointer-events-none z-10 animate-[ping_3.2s_cubic-bezier(0,0,0.2,1)_infinite]" />

          {/* Moving Laser Streak Across Bottom Progress Bar (at y: 75.2%, x: 27.5% - 72.5%) */}
          <div className="absolute top-[75.2%] left-[27.5%] w-[45%] h-[2.6%] overflow-hidden pointer-events-none z-20 rounded-full">
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee] opacity-80"
            />
          </div>

          {/* ===================================================================== */}
          {/* 2. POLISHED USER-FACING HEADERS (ZERO TECHNICAL JARGON)               */}
          {/* ===================================================================== */}

          {/* Clean User-Facing Title: Top-Left */}
          <div className="absolute top-[2.2%] left-[2.8%] z-30">
            <div className="px-3 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-[10.5px] sm:text-xs font-black tracking-widest flex items-center gap-2 shadow-[0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="text-white">TALENTSCORE</span>
              <span className="text-cyan-400 font-bold">INTELLIGENCE</span>
            </div>
          </div>

          {/* Clean User-Facing Header: Right Diagnostic Terminal */}
          <div className="absolute top-[24.5%] left-[71.2%] z-30 pointer-events-none">
            <div className="px-2.5 py-0.5 rounded bg-slate-950/95 text-cyan-300 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider flex items-center gap-1.5 border-b border-cyan-500/40 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>SYSTEM INITIALIZATION</span>
            </div>
          </div>

          {/* Dynamic Top-Center Candidate & Company Telemetry Patch (Real Live Data) */}
          <div className="absolute top-[7.5%] left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center max-w-[85%] sm:max-w-[60%]">
            <div className="inline-block px-5 py-1.5 rounded-2xl bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.3)]">
              <h2 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate">
                {company || 'TalentXcel Global Platform'}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] sm:text-xs font-medium">
                <span className="text-cyan-200 font-bold truncate">{displayName}</span>
                {title && <span className="text-slate-400">• {title}</span>}
                {industry && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9.5px] font-mono border border-cyan-400/30">
                    <Globe className="w-2.5 h-2.5" />
                    {industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Central Globe Live Score & Tier Overlay (Real Live Data) */}
          <div 
            onClick={() => {
              playPulseSound(800, 0.25);
              onGetInsights?.();
            }}
            className="absolute top-[35.5%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center cursor-pointer group"
            title="Click to explore your Live TalentScore Breakdown"
          >
            <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-slate-950/85 border border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.5)] group-hover:scale-105 group-hover:border-cyan-300 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.75)] transition-all text-center backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]">
                {score}
              </div>
              <div className="text-[8px] sm:text-[9.5px] font-black tracking-[0.24em] text-cyan-400 uppercase mt-0.5 drop-shadow-[0_0_8px_#22d3ee]">
                TALENT SCORE
              </div>
            </div>

            {/* Dynamic Tier Badge based on Live Computed Score */}
            <div className="mt-2.5">
              <span className={`inline-block px-3.5 py-0.5 rounded-full text-[9px] sm:text-[10.5px] font-extrabold tracking-wider shadow-sm uppercase ${
                score >= 850
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
                  : score >= 700
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_14px_rgba(34,211,238,0.5)]'
                  : score >= 550
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-r from-slate-600 to-blue-700 text-white shadow-[0_0_14px_rgba(59,130,246,0.4)]'
              }`}>
                {score >= 850 ? 'Elite Tier' : score >= 700 ? 'Strong Tier' : score >= 550 ? 'Emerging Tier' : 'Building Tier'}
              </span>
            </div>
          </div>

          {/* Top-Right Control Bar: Recalibrate, Audio, & Mode Switch */}
          <div className="absolute top-[2%] right-[2.5%] z-30 flex items-center gap-2 sm:gap-2.5">
            {/* Recalibrate Button */}
            <button
              type="button"
              onClick={handleRecalibrate}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-300 text-[10.5px] sm:text-xs font-mono font-bold transition-all shadow-sm backdrop-blur-md cursor-pointer group"
              title="Recalibrate Live Career Telemetry"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 group-hover:rotate-180 transition-transform ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Recalibrate'}</span>
            </button>

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) {
                  playPulseSound(580, 0.2);
                  toast.success('Audio cues active');
                } else {
                  toast.info('Audio muted');
                }
              }}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs transition-all backdrop-blur-md cursor-pointer"
              title={audioEnabled ? "Mute audio cues" : "Enable audio cues"}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* View Mode Switch (Clean User-Facing Term) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/80 bg-slate-950/70 p-1 rounded-lg backdrop-blur-md">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase hidden sm:inline">
                Immersive View
              </span>
              <Switch
                checked={immersiveMode}
                onCheckedChange={(checked) => {
                  setImmersiveMode(checked);
                  onToggleCinematic?.(checked);
                }}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. VISIBLE & CLICKABLE TELEMETRY CHIPS (SKILLS, EXPERIENCE, GROWTH, OPPORTUNITIES) */}
          {/* ===================================================================== */}

          {/* Chip 1: SKILLS */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(550, 0.2);
              onStatClick?.('skills');
            }}
            className="absolute top-[27.2%] left-[28.5%] w-[12.2%] h-[7.4%] rounded-xl cursor-pointer z-30 transition-all duration-200 bg-[#03091e]/92 hover:bg-[#07173e] border border-cyan-400/85 hover:border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.4)] hover:shadow-[0_0_26px_rgba(34,211,238,0.7)] hover:scale-[1.04] active:scale-95 flex items-center justify-between px-2.5 text-left group"
            title="Click to view Skills & Verified Competencies"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-cyan-500/25 border border-cyan-400/70 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_8px_#22d3ee]">
                <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-white uppercase group-hover:text-cyan-300 transition-colors truncate">
                  SKILLS
                </div>
                <div className="text-[8px] sm:text-[9px] text-cyan-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  <span>Scanning...</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400/80 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden md:block" />
          </button>

          {/* Chip 2: EXPERIENCE */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(580, 0.2);
              onStatClick?.('experience');
            }}
            className="absolute top-[36.0%] left-[28.5%] w-[12.2%] h-[7.4%] rounded-xl cursor-pointer z-30 transition-all duration-200 bg-[#03091e]/92 hover:bg-[#07173e] border border-blue-400/85 hover:border-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:shadow-[0_0_26px_rgba(59,130,246,0.7)] hover:scale-[1.04] active:scale-95 flex items-center justify-between px-2.5 text-left group"
            title="Click to view Experience & Career History"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-500/25 border border-blue-400/70 flex items-center justify-center text-blue-300 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_8px_#3b82f6]">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-white uppercase group-hover:text-blue-300 transition-colors truncate">
                  EXPERIENCE
                </div>
                <div className="text-[8px] sm:text-[9px] text-blue-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />
                  <span>Analyzing...</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/80 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden md:block" />
          </button>

          {/* Chip 3: GROWTH */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(620, 0.2);
              onStatClick?.('growth');
            }}
            className="absolute top-[44.8%] left-[28.5%] w-[12.2%] h-[7.4%] rounded-xl cursor-pointer z-30 transition-all duration-200 bg-[#03091e]/92 hover:bg-[#07173e] border border-amber-400/85 hover:border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)] hover:shadow-[0_0_26px_rgba(245,158,11,0.7)] hover:scale-[1.04] active:scale-95 flex items-center justify-between px-2.5 text-left group"
            title={`Click to view Growth Delta (${growthDeltaOverride})`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500/25 border border-amber-400/70 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_8px_#f59e0b]">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors truncate">
                  GROWTH
                </div>
                <div className="text-[8px] sm:text-[9px] text-amber-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span>{growthDeltaOverride.includes('PTS') || growthDeltaOverride.includes('Pts') ? growthDeltaOverride : `${growthDeltaOverride} PTS`}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden md:block" />
          </button>

          {/* Chip 4: OPPORTUNITIES */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(660, 0.2);
              onStatClick?.('opportunities');
            }}
            className="absolute top-[53.6%] left-[28.5%] w-[12.2%] h-[7.4%] rounded-xl cursor-pointer z-30 transition-all duration-200 bg-[#03091e]/92 hover:bg-[#07173e] border border-emerald-400/85 hover:border-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.4)] hover:shadow-[0_0_26px_rgba(16,185,129,0.7)] hover:scale-[1.04] active:scale-95 flex items-center justify-between px-2.5 text-left group"
            title="Click to view Matched Career Opportunities"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-500/25 border border-emerald-400/70 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_8px_#10b981]">
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-white uppercase group-hover:text-emerald-300 transition-colors truncate">
                  OPPORTUNITIES
                </div>
                <div className="text-[8px] sm:text-[9px] text-emerald-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Mapping...</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden md:block" />
          </button>

          {/* ===================================================================== */}
          {/* 4. OTHER INTERACTIVE HOTSPOTS (GLOBE & BOTTOM ACTION PILLARS)          */}
          {/* ===================================================================== */}

          {/* Hotspot 1: Discover Strengths (Bottom Left Icon) */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(600, 0.2);
              onDiscoverStrengths?.();
            }}
            onMouseEnter={() => setHoveredZone('strengths')}
            onMouseLeave={() => setHoveredZone(null)}
            className="absolute top-[83.5%] left-[30.5%] w-[8.5%] h-[13%] rounded-xl cursor-pointer z-30 transition-all hover:bg-cyan-400/10 hover:border hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            title="Discover Strengths - View Top Competencies"
          />

          {/* Hotspot 2: Get Insights (Bottom Center-Left Icon) */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(650, 0.2);
              onGetInsights?.();
            }}
            onMouseEnter={() => setHoveredZone('insights')}
            onMouseLeave={() => setHoveredZone(null)}
            className="absolute top-[83.5%] left-[40.5%] w-[8.5%] h-[13%] rounded-xl cursor-pointer z-30 transition-all hover:bg-cyan-400/10 hover:border hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            title="Get Insights - Deep TalentScore Analytics"
          />

          {/* Hotspot 3: Unlock Opportunities (Bottom Center-Right Icon) */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(700, 0.2);
              onUnlockOpportunities?.();
            }}
            onMouseEnter={() => setHoveredZone('opportunities')}
            onMouseLeave={() => setHoveredZone(null)}
            className="absolute top-[83.5%] left-[51.5%] w-[8.5%] h-[13%] rounded-xl cursor-pointer z-30 transition-all hover:bg-cyan-400/10 hover:border hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            title="Unlock Opportunities - Matched Executive Roles"
          />

          {/* Hotspot 4: Build Your Future (Bottom Right Icon) */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(750, 0.2);
              onBuildFuture?.();
            }}
            onMouseEnter={() => setHoveredZone('future')}
            onMouseLeave={() => setHoveredZone(null)}
            className="absolute top-[83.5%] left-[62%] w-[8.5%] h-[13%] rounded-xl cursor-pointer z-30 transition-all hover:bg-cyan-400/10 hover:border hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            title="Build Your Future - Executive Career Roadmap"
          />

          {/* Hotspot: Central Globe (Opens Detailed Breakdown) */}
          <button
            type="button"
            onClick={() => {
              playPulseSound(800, 0.25);
              onGetInsights?.();
            }}
            onMouseEnter={() => setHoveredZone('globe')}
            onMouseLeave={() => setHoveredZone(null)}
            className="absolute top-[26%] left-[41%] w-[18%] h-[36%] rounded-full cursor-pointer z-30 transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:border-2 hover:border-cyan-300/60"
            title={`Click to explore your ${score} TalentScore Breakdown`}
          />
        </div>

        {/* Mobile-Friendly Quick Telemetry Bar (Visible on smaller screens below 16:9 canvas) */}
        <div className="sm:hidden grid grid-cols-2 gap-2 mt-2.5 px-1 pb-1">
          <button
            type="button"
            onClick={() => {
              playPulseSound(550, 0.2);
              onStatClick?.('skills');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#040f26]/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.25)] text-left active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              <Brain className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white tracking-wider">SKILLS</div>
              <div className="text-[10px] text-cyan-400 font-mono">Scanning...</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playPulseSound(580, 0.2);
              onStatClick?.('experience');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#040f26]/90 border border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.25)] text-left active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-300 shrink-0">
              <Briefcase className="w-4 h-4 text-blue-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white tracking-wider">EXPERIENCE</div>
              <div className="text-[10px] text-blue-400 font-mono">Analyzing...</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playPulseSound(620, 0.2);
              onStatClick?.('growth');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#040f26]/90 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] text-left active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white tracking-wider">GROWTH</div>
              <div className="text-[10px] text-amber-400 font-mono">{growthDeltaOverride.includes('PTS') || growthDeltaOverride.includes('Pts') ? growthDeltaOverride : `${growthDeltaOverride} PTS`}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playPulseSound(660, 0.2);
              onStatClick?.('opportunities');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#040f26]/90 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] text-left active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <Target className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white tracking-wider">OPPORTUNITIES</div>
              <div className="text-[10px] text-emerald-400 font-mono">Mapping...</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentScoreVFXHero;
