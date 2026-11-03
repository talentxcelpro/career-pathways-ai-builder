import React, { useState } from 'react';
import {
  Award,
  Zap,
  Code2,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  Flame,
  Brain,
  Palette,
  Shield,
  Edit3
} from 'lucide-react';
import { UnifiedSkillProfile } from '@/services/careerverse/careerIntelligenceEngine';
import { Button } from '@/components/ui/button';

interface PlayerCharacterHUDProps {
  profile: UnifiedSkillProfile;
  onOpenPassport: () => void;
  onOpenAchievements: () => void;
  onEditProfile?: () => void;
  onLaunchChallenge?: () => void;
}

export const PlayerCharacterHUD: React.FC<PlayerCharacterHUDProps> = ({
  profile,
  onOpenPassport,
  onOpenAchievements,
  onEditProfile,
  onLaunchChallenge,
}) => {
  const [showAttributeDetails, setShowAttributeDetails] = useState(false);

  // Compute level progress
  const currentXP = profile.totalXP;
  const levelFloorXP = (profile.level - 1) * 250;
  const levelCeilXP = profile.level * 250;
  const progressInLevel = Math.max(0, currentXP - levelFloorXP);
  const neededInLevel = Math.max(1, levelCeilXP - levelFloorXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / neededInLevel) * 100));

  // Determine skills to display in top 3 chips
  // If assessed skills exist, use them. Otherwise show declared or unassessed indicators.
  const displaySkills = [
    {
      name: profile.assessedSkills[0]?.name || profile.unassessedDeclaredSkills[0] || (profile.isGuest ? 'Skill Discovery' : 'Technical Skill'),
      score: profile.assessedSkills[0]?.score ?? null,
      status: profile.assessedSkills[0] ? 'assessed' : profile.unassessedDeclaredSkills[0] ? 'declared' : 'unassessed',
      icon: Code2,
      accent: '#FFCA55',
    },
    {
      name: profile.assessedSkills[1]?.name || profile.unassessedDeclaredSkills[1] || (profile.isGuest ? 'Skill Challenge' : 'Domain Skill'),
      score: profile.assessedSkills[1]?.score ?? null,
      status: profile.assessedSkills[1] ? 'assessed' : profile.unassessedDeclaredSkills[1] ? 'declared' : 'unassessed',
      icon: Zap,
      accent: '#36D9F5',
    },
    {
      name: profile.assessedSkills[2]?.name || profile.unassessedDeclaredSkills[2] || (profile.isGuest ? 'Career Readiness' : 'Interpersonal Skill'),
      score: profile.assessedSkills[2]?.score ?? null,
      status: profile.assessedSkills[2] ? 'assessed' : profile.unassessedDeclaredSkills[2] ? 'declared' : 'unassessed',
      icon: MessageSquare,
      accent: '#A34EFF',
    },
  ];

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-[#7047F5]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-[#36D9F5]/10 blur-3xl pointer-events-none" />

      {/* Top Identity: Avatar + Hexagon Badge + Non-truncated Name & Status */}
      <div className="flex items-start gap-3.5 z-10">
        {/* Avatar with Animated Border */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7047F5] via-[#278DFF] to-[#36D9F5] p-0.5 shadow-lg shadow-[#7047F5]/30">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full rounded-[14px] object-cover bg-[#071329]"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-[#071329] flex items-center justify-center text-xl font-black text-white">
                {profile.displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Hexagon Level Badge */}
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#FFCA55] to-[#FFA726] text-slate-950 font-black text-[11px] shadow-md flex items-center gap-0.5 border border-white/20">
            <span>Lv.</span>
            <span>{profile.level}</span>
          </div>
        </div>

        {/* Name, Headline, and Institution without awkward truncation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-base sm:text-lg font-black text-white break-words leading-snug">
              {profile.displayName}
            </h3>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                title="Edit Character Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-[#36D9F5] truncate mt-0.5">{profile.headline}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {profile.collegeName || (profile.isGuest ? 'Guest Mode · Preview' : 'Independent Candidate')}
          </p>
        </div>
      </div>

      {/* Real XP Progression Bar */}
      <div className="flex flex-col gap-1.5 z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-semibold">Level Progression</span>
            {profile.isGuest && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Preview
              </span>
            )}
          </div>
          <span className="font-bold text-white text-[11px]">
            {currentXP.toLocaleString()} / {levelCeilXP.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#7047F5] via-[#278DFF] to-[#36D9F5] rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Skill Chips: Genuine Assessed Scores or "Not Assessed" Badges (NO FAKE STATS) */}
      <div className="grid grid-cols-3 gap-2 z-10">
        {displaySkills.map((sk, idx) => (
          <div
            key={idx}
            className="bg-[#071329]/90 border border-white/5 hover:border-white/20 transition-all rounded-xl p-2.5 text-center flex flex-col items-center justify-between min-h-[78px]"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center mb-1"
              style={{ backgroundColor: `${sk.accent}20` }}
            >
              <sk.icon className="w-3.5 h-3.5" style={{ color: sk.accent }} />
            </div>

            {sk.status === 'assessed' && sk.score !== null ? (
              <span className="text-base font-black text-white">{sk.score}</span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                Not assessed
              </span>
            )}

            <span className="text-[10px] text-slate-300 font-medium truncate w-full mt-1">
              {sk.name}
            </span>
          </div>
        ))}
      </div>

      {/* 5-Axis Character Attributes Accordion / Toggle */}
      <div className="z-10 bg-[#071329]/60 border border-white/5 rounded-xl p-3">
        <button
          onClick={() => setShowAttributeDetails(!showAttributeDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-[#36D9F5]" />
            <span>Character Attributes (5-Axis)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#36D9F5]">
            <span>{showAttributeDetails ? 'Collapse' : 'Details'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAttributeDetails ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {showAttributeDetails && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs">
            {/* Intelligence */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" /> Intelligence
              </span>
              <span className={`font-bold ${profile.attributes.intelligence.assessed ? 'text-white' : 'text-slate-500'}`}>
                {profile.attributes.intelligence.assessed ? `${profile.attributes.intelligence.score}/100` : 'Not Assessed'}
              </span>
            </div>

            {/* Technical Power */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Technical Power
              </span>
              <span className={`font-bold ${profile.attributes.technicalPower.assessed ? 'text-white' : 'text-slate-500'}`}>
                {profile.attributes.technicalPower.assessed ? `${profile.attributes.technicalPower.score}/100` : 'Declared only'}
              </span>
            </div>

            {/* Communication */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Communication
              </span>
              <span className={`font-bold ${profile.attributes.communication.assessed ? 'text-white' : 'text-slate-500'}`}>
                {profile.attributes.communication.assessed ? `${profile.attributes.communication.score}/100` : 'Profile summary'}
              </span>
            </div>

            {/* Creativity */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Creativity & Design
              </span>
              <span className={`font-bold ${profile.attributes.creativity.assessed ? 'text-white' : 'text-slate-500'}`}>
                {profile.attributes.creativity.assessed ? `${profile.attributes.creativity.score}/100` : 'Portfolio'}
              </span>
            </div>

            {/* Career Readiness */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Career Readiness
              </span>
              <span className="font-bold text-white">
                {profile.overallReadinessScore}%
              </span>
            </div>

            {onLaunchChallenge && (
              <div className="pt-2">
                <Button
                  onClick={onLaunchChallenge}
                  size="sm"
                  className="w-full text-xs h-8 bg-gradient-to-r from-[#7047F5] to-[#278DFF] hover:from-[#6035e0] hover:to-[#1a7ae0] font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Benchmark Skills in Quick Quest
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Career Passport Gateway */}
      <button
        onClick={onOpenPassport}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#18264A] to-[#121E38] border border-[#278DFF]/30 hover:border-[#36D9F5]/70 transition-all group z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#278DFF]/20 flex items-center justify-center text-[#36D9F5]">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white group-hover:text-[#36D9F5] transition-colors">
              Career Passport
            </h4>
            <p className="text-[10px] text-slate-400">Your verified career credentials</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Achievements Preview */}
      <div className="flex flex-col gap-2 pt-1 z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Achievements</span>
          <button
            onClick={onOpenAchievements}
            className="text-[11px] font-semibold text-[#36D9F5] hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#FFCA55]/30">
            <Award className="w-5 h-5 text-[#FFCA55] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">First Quest</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#7047F5]/30">
            <Code2 className="w-5 h-5 text-[#A34EFF] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">Code Warrior</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#20D994]/30">
            <MessageSquare className="w-5 h-5 text-[#20D994] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">Interview Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
