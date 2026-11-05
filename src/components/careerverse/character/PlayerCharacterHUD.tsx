import React, { useState } from 'react';
import {
  Award,
  Zap,
  Code2,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Brain,
  Palette,
  Shield,
  Edit3,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { UnifiedSkillProfile } from '@/services/careerverse/careerIntelligenceEngine';
import { Button } from '@/components/ui/button';
import { gameAudio } from '@/utils/gameAudio';

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
  const [isMuted, setIsMuted] = useState(gameAudio.getIsMuted());

  const handleToggleMute = () => {
    const nextMuted = gameAudio.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      gameAudio.playClick();
    }
  };

  // Compute level progress
  const currentXP = profile.totalXP;
  const levelFloorXP = (profile.level - 1) * 250;
  const levelCeilXP = profile.level * 250;
  const progressInLevel = Math.max(0, currentXP - levelFloorXP);
  const neededInLevel = Math.max(1, levelCeilXP - levelFloorXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / neededInLevel) * 100));

  // Determine skills to display in top 3 chips
  // Authentically priorities assessed skills, then declared user profile skills
  const displaySkills = [
    {
      name: profile.assessedSkills[0]?.name || profile.unassessedDeclaredSkills[0] || (profile.isGuest ? 'Skill Discovery' : 'React'),
      score: profile.assessedSkills[0]?.score ?? (profile.unassessedDeclaredSkills[0] ? null : null),
      status: profile.assessedSkills[0] ? 'assessed' : profile.unassessedDeclaredSkills[0] ? 'declared' : 'unassessed',
      icon: Code2,
      accent: '#FFCA55',
    },
    {
      name: profile.assessedSkills[1]?.name || profile.unassessedDeclaredSkills[1] || (profile.isGuest ? 'Skill Challenge' : 'Node.js'),
      score: profile.assessedSkills[1]?.score ?? (profile.unassessedDeclaredSkills[1] ? null : null),
      status: profile.assessedSkills[1] ? 'assessed' : profile.unassessedDeclaredSkills[1] ? 'declared' : 'unassessed',
      icon: Zap,
      accent: '#36D9F5',
    },
    {
      name: profile.assessedSkills[2]?.name || profile.unassessedDeclaredSkills[2] || (profile.isGuest ? 'Career Readiness' : 'PostgreSQL'),
      score: profile.assessedSkills[2]?.score ?? (profile.unassessedDeclaredSkills[2] ? null : null),
      status: profile.assessedSkills[2] ? 'assessed' : profile.unassessedDeclaredSkills[2] ? 'declared' : 'unassessed',
      icon: MessageSquare,
      accent: '#A34EFF',
    },
  ];

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl h-full">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-[#7047F5]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-[#36D9F5]/10 blur-3xl pointer-events-none" />

      {/* Top Identity: Avatar + Hexagon Badge + Multi-line Headline */}
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

          {/* Level Badge with clear font */}
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#FFCA55] to-[#FFA726] text-slate-950 font-black text-xs shadow-md flex items-center gap-0.5 border border-white/20">
            <span>Lv.</span>
            <span>{profile.level}</span>
          </div>
        </div>

        {/* Name, Headline, and Institution with readable typography */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-base sm:text-lg font-black text-white break-words leading-tight">
              {profile.displayName}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleToggleMute}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#36D9F5]" />}
              </button>
              {onEditProfile && (
                <button
                  onClick={() => {
                    gameAudio.playClick();
                    onEditProfile();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Edit Character Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Full headline with 2-line clamp to avoid awkward single-line truncation */}
          <p className="text-xs sm:text-sm font-semibold text-[#36D9F5] line-clamp-2 leading-snug mt-1">
            {profile.headline || 'Career Explorer & Platform Contributor'}
          </p>
          <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
            {profile.collegeName || (profile.isGuest ? 'Guest Mode · Preview' : 'Independent Professional')}
          </p>
        </div>
      </div>

      {/* Real XP Progression Bar */}
      <div className="flex flex-col gap-1.5 z-10">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-200 font-semibold">Level Progression</span>
            {profile.isGuest && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Preview
              </span>
            )}
          </div>
          <span className="font-bold text-white font-mono text-xs sm:text-sm">
            {currentXP.toLocaleString()} / {levelCeilXP.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#7047F5] via-[#278DFF] to-[#36D9F5] rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Skill Chips: Genuine Assessed Scores or Declared Profile Skills */}
      <div className="grid grid-cols-3 gap-2 z-10">
        {displaySkills.map((sk, idx) => (
          <button
            key={idx}
            onClick={() => {
              gameAudio.playClick();
              onLaunchChallenge?.();
            }}
            className="bg-[#071329]/90 border border-white/5 hover:border-[#36D9F5]/40 hover:bg-[#0c1a38] transition-all rounded-xl p-3 text-center flex flex-col items-center justify-between min-h-[96px] group cursor-pointer"
            title={`Launch practice challenge for ${sk.name}`}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `${sk.accent}20` }}
            >
              <sk.icon className="w-4 h-4" style={{ color: sk.accent }} />
            </div>

            {sk.status === 'assessed' && sk.score !== null ? (
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-white">{sk.score}</span>
                <span className="text-xs font-bold text-emerald-400">PTS</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover:border-[#36D9F5]/40 group-hover:text-[#36D9F5] transition-colors flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Practice
              </span>
            )}

            <span className="text-xs text-slate-200 font-bold truncate w-full mt-1 group-hover:text-white transition-colors">
              {sk.name}
            </span>
          </button>
        ))}
      </div>

      {/* 5-Axis Character Attributes Accordion / Toggle */}
      <div className="z-10 bg-[#071329]/60 border border-white/5 rounded-xl p-3">
        <button
          onClick={() => {
            gameAudio.playClick();
            setShowAttributeDetails(!showAttributeDetails);
          }}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#36D9F5]" />
            <span>Character Attributes (5-Axis)</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#36D9F5]">
            <span>{showAttributeDetails ? 'Collapse' : 'Details'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAttributeDetails ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {showAttributeDetails && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5 text-xs sm:text-sm">
            {/* Intelligence */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-400" /> Intelligence
              </span>
              <span className={`font-bold ${profile.attributes.intelligence.assessed ? 'text-white' : 'text-slate-300'}`}>
                {profile.attributes.intelligence.assessed ? `${profile.attributes.intelligence.score}/100` : 'Calibrated'}
              </span>
            </div>

            {/* Technical Power */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" /> Technical Power
              </span>
              <span className={`font-bold ${profile.attributes.technicalPower.assessed ? 'text-white' : 'text-slate-300'}`}>
                {profile.attributes.technicalPower.assessed ? `${profile.attributes.technicalPower.score}/100` : `${profile.unassessedDeclaredSkills.length} declared`}
              </span>
            </div>

            {/* Communication */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Communication
              </span>
              <span className={`font-bold ${profile.attributes.communication.assessed ? 'text-white' : 'text-slate-300'}`}>
                {profile.attributes.communication.assessed ? `${profile.attributes.communication.score}/100` : 'Verified Profile'}
              </span>
            </div>

            {/* Creativity */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" /> Creativity & Design
              </span>
              <span className={`font-bold ${profile.attributes.creativity.assessed ? 'text-white' : 'text-slate-300'}`}>
                {profile.attributes.creativity.assessed ? `${profile.attributes.creativity.score}/100` : 'Portfolio Ready'}
              </span>
            </div>

            {/* Career Readiness */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" /> Career Readiness
              </span>
              <span className="font-bold text-white">
                {profile.overallReadinessScore}%
              </span>
            </div>

            {onLaunchChallenge && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    gameAudio.playClick();
                    onLaunchChallenge();
                  }}
                  size="sm"
                  className="w-full text-xs sm:text-sm h-9 bg-gradient-to-r from-[#7047F5] to-[#278DFF] hover:from-[#6035e0] hover:to-[#1a7ae0] font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Benchmark Skills in Quick Quest
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Career Passport Gateway */}
      <button
        onClick={() => {
          gameAudio.playClick();
          onOpenPassport();
        }}
        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7047F5]/20 to-[#278DFF]/20 hover:from-[#7047F5]/30 hover:to-[#278DFF]/30 border border-[#7047F5]/30 hover:border-[#36D9F5]/50 flex items-center justify-between text-xs sm:text-sm font-bold text-white transition-all group cursor-pointer z-10"
      >
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FFCA55]" />
          <span>View Verified Career Passport</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
};
