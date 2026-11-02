import React from 'react';
import { Compass, Sparkles, Shield, Cpu, Cloud, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UnifiedSkillProfile } from '@/services/careerverse/careerIntelligenceEngine';

export interface CareerRealm {
  id: string;
  name: string;
  subTitle: string;
  category: 'frontend' | 'backend' | 'ai_ml' | 'devops' | 'cybersecurity' | 'python';
  minLevel: number;
  unlocked: boolean;
  masteryPercent: number;
  icon: string;
  skills: string[];
  bossName: string;
  accentColor: string;
}

interface CareerWorldMapProps {
  currentPath: string;
  playerLevel: number;
  onSelectRealm: (realm: CareerRealm) => void;
  onEnterWorldPortal: () => void;
}

export const CareerWorldMap: React.FC<CareerWorldMapProps> = ({
  currentPath,
  playerLevel,
  onSelectRealm,
  onEnterWorldPortal,
}) => {
  const realms: CareerRealm[] = [
    {
      id: 'realm_frontend',
      name: 'Frontend Kingdom',
      subTitle: 'Modern UI & Component Architecture',
      category: 'frontend',
      minLevel: 1,
      unlocked: true,
      masteryPercent: 78,
      icon: '⚛️',
      skills: ['React 19', 'TypeScript', 'Tailwind', 'Next.js'],
      bossName: 'Silicon Leviathan',
      accentColor: '#36D9F5',
    },
    {
      id: 'realm_backend',
      name: 'Backend Fortress',
      subTitle: 'Distributed Systems & Database Scaling',
      category: 'backend',
      minLevel: 1,
      unlocked: true,
      masteryPercent: 62,
      icon: '🛡️',
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL'],
      bossName: 'Concurrency Behemoth',
      accentColor: '#7047F5',
    },
    {
      id: 'realm_aiml',
      name: 'AI/ML Citadel',
      subTitle: 'Neural Networks & LLM Orchestration',
      category: 'ai_ml',
      minLevel: 5,
      unlocked: playerLevel >= 5,
      masteryPercent: playerLevel >= 5 ? 40 : 0,
      icon: '🧠',
      skills: ['PyTorch', 'Vector Embeddings', 'RAG Pipelines'],
      bossName: 'Deep Singularity Core',
      accentColor: '#A34EFF',
    },
    {
      id: 'realm_cloud',
      name: 'Cloud City',
      subTitle: 'Kubernetes & Infrastructure Reliability',
      category: 'devops',
      minLevel: 8,
      unlocked: playerLevel >= 8,
      masteryPercent: playerLevel >= 8 ? 25 : 0,
      icon: '☁️',
      skills: ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
      bossName: 'Overclocked Cloud Titan',
      accentColor: '#278DFF',
    },
    {
      id: 'realm_cyber',
      name: 'Cybersecurity Realm',
      subTitle: 'Zero-Trust Architecture & Cryptography',
      category: 'cybersecurity',
      minLevel: 10,
      unlocked: playerLevel >= 10,
      masteryPercent: playerLevel >= 10 ? 15 : 0,
      icon: '🔒',
      skills: ['OWASP Top 10', 'RLS Policies', 'Public Key Crypto'],
      bossName: 'Zero-Day Phantom',
      accentColor: '#20D994',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B1730] via-[#071329] to-[#050D1C] border border-[#7047F5]/30 p-5 sm:p-7 shadow-2xl space-y-5">
      {/* Background Starlight & Hologram Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#36D9F5]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#7047F5]/25 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#36D9F5] shadow-[0_0_8px_rgba(54,217,245,0.8)] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#36D9F5]">
              TalentXcel CareerVerse World Map
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Explore Professional Career Realms
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a destination to unlock tailored quests, skill tree pathways, and verified recruiter challenges.
          </p>
        </div>

        <button
          onClick={onEnterWorldPortal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7047F5] via-[#A34EFF] to-[#36D9F5] hover:from-[#36D9F5] hover:to-[#7047F5] text-white font-black text-xs shadow-[0_0_20px_rgba(112,71,245,0.5)] flex items-center gap-2 transition-all transform hover:scale-105 shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Quick Quest Launch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Holographic 2.5D Realms Carousel / Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
        {realms.map((realm) => {
          const isSelected = currentPath.toLowerCase().includes(realm.category);

          return (
            <div
              key={realm.id}
              onClick={() => onSelectRealm(realm)}
              className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#101E3B] to-[#0B1730] border-[#36D9F5] shadow-[0_0_25px_rgba(54,217,245,0.3)] scale-[1.02]'
                  : realm.unlocked
                  ? 'bg-[#0B1730]/80 border-white/10 hover:border-white/20 hover:bg-[#101E3B]'
                  : 'bg-[#071329]/40 border-white/5 opacity-60'
              }`}
            >
              <div>
                {/* Realm Icon & Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#071329] border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {realm.icon}
                  </div>

                  {realm.unlocked ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#20D994]/20 text-[#20D994] border border-[#20D994]/30">
                      Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      <Lock className="w-3 h-3" />
                      <span>Lv. {realm.minLevel}</span>
                    </span>
                  )}
                </div>

                <h4 className="font-black text-sm text-white group-hover:text-[#36D9F5] transition-colors leading-tight">
                  {realm.name}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">{realm.subTitle}</p>
              </div>

              {/* Mastery Meter & Skills */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">Realm Mastery</span>
                  <span className="text-[#36D9F5]">{realm.masteryPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#071329] overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7047F5] to-[#36D9F5]"
                    style={{ width: `${realm.masteryPercent}%` }}
                  />
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {realm.skills.slice(0, 2).map((s) => (
                    <span key={s} className="text-[9px] bg-[#071329] px-1.5 py-0.5 rounded text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
