import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/careerverse.css';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import {
  CareerPlayer,
  GUEST_PLAYER,
  CareerPlayerService
} from '@/services/careerverse/careerPlayerService';
import { CareerQuest, CareerQuestService } from '@/services/careerverse/careerQuestService';
import { CareerTreeSkill, CareerSkillTreeService } from '@/services/careerverse/careerSkillTreeService';
import { CareerBossBattle, CareerBossBattleService } from '@/services/careerverse/careerBossBattleService';
import {
  LeaderboardPlayer,
  CampusGuild,
  CareerLeaderboardService
} from '@/services/careerverse/careerLeaderboardService';
import {
  CareerEvent,
  CareerBadgeAndRewardsService
} from '@/services/careerverse/careerBadgeAndRewardsService';
import { CareerRealtimeService } from '@/services/careerverse/careerRealtimeService';
import {
  careerIntelligenceEngine,
  UnifiedSkillProfile
} from '@/services/careerverse/careerIntelligenceEngine';
import {
  careerQuestEngine,
  PlayableQuest
} from '@/services/careerverse/careerQuestEngine';

import { CareerVerseHeader } from '@/components/careerverse/CareerVerseHeader';
import { CareerVerseSidebar } from '@/components/careerverse/CareerVerseSidebar';
import { HeroBanner } from '@/components/careerverse/HeroBanner';
import { PlayerCharacterHUD } from '@/components/careerverse/character/PlayerCharacterHUD';
import { DailyQuestsCard } from '@/components/careerverse/DailyQuestsCard';
import { SkillTreePreviewCard } from '@/components/careerverse/SkillTreePreviewCard';
import { BossBattleCard } from '@/components/careerverse/BossBattleCard';
import { LeaderboardWidget } from '@/components/careerverse/LeaderboardWidget';
import { GuildWidget } from '@/components/careerverse/GuildWidget';
import { EventsWidget } from '@/components/careerverse/EventsWidget';
import { MobileCareerVerseNav } from '@/components/careerverse/MobileCareerVerseNav';

import { PlayableCodeArena } from '@/components/careerverse/gameplay/PlayableCodeArena';
import { PlayableLogicGame } from '@/components/careerverse/gameplay/PlayableLogicGame';
import { PlayableBossBattleArena } from '@/components/careerverse/gameplay/PlayableBossBattleArena';
import { CareerWorldMap } from '@/components/careerverse/world/CareerWorldMap';

import { QuestWorkspaceModal } from '@/components/careerverse/QuestWorkspaceModal';
import { FullSkillTreeModal } from '@/components/careerverse/FullSkillTreeModal';
import { RewardsStoreModal } from '@/components/careerverse/RewardsStoreModal';
import { AchievementsModal } from '@/components/careerverse/AchievementsModal';
import { AICareerCompanionModal } from '@/components/careerverse/AICareerCompanionModal';
import { Loader2, Sparkles, LogIn, UserPlus, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CareerVersePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useOptimizedAuth();
  const navigate = useNavigate();

  // Primary State
  const [player, setPlayer] = useState<CareerPlayer>(GUEST_PLAYER);
  const [unifiedProfile, setUnifiedProfile] = useState<UnifiedSkillProfile>(
    careerIntelligenceEngine.getGuestProfile()
  );
  const [quests, setQuests] = useState<CareerQuest[]>([]);
  const [playableQuests, setPlayableQuests] = useState<PlayableQuest[]>([]);
  const [treeSkills, setTreeSkills] = useState<CareerTreeSkill[]>([]);
  const [bossBattles, setBossBattles] = useState<CareerBossBattle[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'college' | 'react' | 'overall'>('college');
  const [guild, setGuild] = useState<CampusGuild | null>(null);
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Modal & Arena States
  const [activeQuest, setActiveQuest] = useState<CareerQuest | null>(null);
  const [activeCodeQuest, setActiveCodeQuest] = useState<PlayableQuest | null>(null);
  const [activeLogicQuest, setActiveLogicQuest] = useState<PlayableQuest | null>(null);
  const [isBossArenaOpen, setIsBossArenaOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isSkillTreeModalOpen, setIsSkillTreeModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);

  const isGuest = !isAuthenticated || !user;

  // Refresh player & intelligence profile state
  const loadPlayerData = useCallback(async () => {
    try {
      const pProfile = await careerIntelligenceEngine.evaluateUserProfile(user?.id);
      setUnifiedProfile(pProfile);

      const pQuests = await careerQuestEngine.getPersonalizedQuests(pProfile);
      setPlayableQuests(pQuests);

      if (user && user.id) {
        const p = await CareerPlayerService.getOrActivatePlayer(
          user.id,
          user.user_metadata?.full_name || user.email?.split('@')[0]
        );
        setPlayer(p);
      } else {
        setPlayer(GUEST_PLAYER);
      }
    } catch (err) {
      console.warn('Failed to reload profile, using fallback:', err);
    }
  }, [user]);

  // Initial Data Load
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        setPageLoading(true);
        const playerId = user?.id || 'guest';

        // Concurrently load authentic intelligence profile, gameplay quests, and database entities
        const [profData, pData, qData, sData, bData, gData, eData] = await Promise.all([
          careerIntelligenceEngine.evaluateUserProfile(user?.id),
          user ? CareerPlayerService.getOrActivatePlayer(user.id, user.user_metadata?.full_name) : Promise.resolve(GUEST_PLAYER),
          CareerQuestService.getQuests(playerId),
          CareerSkillTreeService.getSkillsForPath('technology', playerId),
          CareerBossBattleService.getLiveBattles(playerId),
          CareerLeaderboardService.getCampusGuild(),
          CareerBadgeAndRewardsService.getEvents(playerId)
        ]);

        if (!isMounted) return;

        setUnifiedProfile(profData);
        setPlayer(pData);
        setQuests(qData);
        setTreeSkills(sData);
        setBossBattles(bData);
        setGuild(gData);
        setEvents(eData);

        const pQuests = await careerQuestEngine.getPersonalizedQuests(profData);
        if (isMounted) setPlayableQuests(pQuests);

        // Fetch leaderboard with player context
        const lb = await CareerLeaderboardService.getLeaderboard(leaderboardTab, pData.id, pData.college);
        if (isMounted) setLeaderboard(lb);
      } catch (err) {
        console.error('Error initializing CareerVerse data:', err);
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };

    if (!authLoading) {
      initData();
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, leaderboardTab]);

  // Realtime subscription for authenticated user
  useEffect(() => {
    if (!user?.id) return;

    const channel = CareerRealtimeService.subscribeToPlayerUpdates(user.id, (updated) => {
      setPlayer((prev) => ({
        ...prev,
        ...updated
      }));
      setUnifiedProfile((prev) => ({
        ...prev,
        totalXP: updated.xp ?? prev.totalXP,
        level: updated.level ?? prev.level,
        careerCoins: updated.career_coins ?? prev.careerCoins,
        streakDays: updated.streak_count ?? prev.streakDays
      }));
    });

    return () => {
      CareerRealtimeService.unsubscribe(channel);
    };
  }, [user]);

  // Reload leaderboard when tab changes
  const handleLeaderboardTabChange = async (tab: 'college' | 'react' | 'overall') => {
    setLeaderboardTab(tab);
    try {
      const data = await CareerLeaderboardService.getLeaderboard(tab, player.id, player.college);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard for tab:', tab, err);
    }
  };

  // Launch playable games
  const handleLaunchCodeArena = () => {
    const codeQuest = playableQuests.find((q) => q.type === 'code_challenge') || playableQuests[0];
    if (codeQuest) {
      setActiveCodeQuest(codeQuest);
    }
  };

  const handleLaunchLogicDuel = () => {
    const logicQuest = playableQuests.find((q) => q.type === 'timed_quiz') || playableQuests[1] || playableQuests[0];
    if (logicQuest) {
      setActiveLogicQuest(logicQuest);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#071329] flex flex-col items-center justify-center gap-4 text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 shadow-2xl animate-spin">
            <div className="w-full h-full bg-[#071329] rounded-[14px]" />
          </div>
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#36D9F5] animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="font-black text-lg text-white">Connecting to CareerVerse...</h3>
          <p className="text-xs text-slate-400 mt-1">Calibrating authentic player credentials and live combat arenas</p>
        </div>
      </div>
    );
  }

  const primaryBossBattle = bossBattles[0] || {
    id: '22222222-2222-4000-8000-000000000001',
    title: 'Frontend Developer Challenge',
    company_name: 'Microsoft',
    company_logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    job_id: null,
    role_type: 'Hiring Internship',
    description: 'Complete the 4-stage technical recruitment pipeline to earn direct interview access.',
    stages: ['Code Challenge', 'Debug & Improve', 'Tech Interview', 'Final Interview'],
    xp_reward: 500,
    coins_reward: 150,
    badge_name: 'Dragon Slayer',
    is_live: true,
    user_participation: {
      current_stage: 1,
      status: 'active',
      code_submission: null,
      feedback: null
    }
  };

  return (
    <div className="min-h-screen bg-[#071329] text-white flex flex-col selection:bg-[#7047F5] selection:text-white">
      {/* RPG Top Navigation */}
      <CareerVerseHeader
        player={player}
        isGuest={isGuest}
        onOpenAICoach={() => setIsAICoachOpen(true)}
      />

      {/* Guest Preview Notice Banner if not logged in */}
      {isGuest && (
        <div className="bg-gradient-to-r from-[#7047F5]/30 via-[#278DFF]/20 to-[#101E3B] border-b border-[#36D9F5]/30 px-4 py-2.5">
          <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Sparkles className="w-4 h-4 text-[#36D9F5] flex-shrink-0" />
              <span>
                <strong>Guest Preview Mode:</strong> You are exploring TalentXcel CareerVerse. Play real in-browser challenges below, or sign in to save verified XP and unlock boss hiring pipelines.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth?tab=login')}
                className="text-xs h-7 px-3 text-white hover:bg-white/10"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth?tab=signup')}
                className="text-xs h-7 px-3 bg-[#20D994] hover:bg-[#1cb57b] text-slate-950 font-bold"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Join Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-6 lg:p-8 flex gap-6 pb-24 md:pb-8">
        {/* Left Sidebar */}
        <CareerVerseSidebar
          activeSection="home"
          onNavigateSection={(sec) => {
            if (sec === 'quests') {
              const el = document.getElementById('daily-quests');
              el?.scrollIntoView({ behavior: 'smooth' });
            } else if (sec === 'boss') {
              const el = document.getElementById('boss-battles');
              el?.scrollIntoView({ behavior: 'smooth' });
            } else if (sec === 'leaderboards') {
              const el = document.getElementById('leaderboard-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenPassport={() => navigate('/passport')}
          onOpenRewards={() => setIsRewardsModalOpen(true)}
          onOpenSkillTree={() => setIsSkillTreeModalOpen(true)}
          onOpenAchievements={() => setIsAchievementsModalOpen(true)}
        />

        {/* Center Main Stage (Hero, Player HUD, Quests, Tree Preview, Boss Battle) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Stargate Citadel Hero Banner */}
          <HeroBanner
            onOpenWorldMap={() => setIsWorldMapOpen(true)}
            onOpenQuickQuest={handleLaunchCodeArena}
          />

          {/* 3-Column Core Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* Player Character HUD (Authentic Evidence, No Truncation, 5-Axis Attributes) */}
            <PlayerCharacterHUD
              profile={unifiedProfile}
              onOpenPassport={() => navigate('/passport')}
              onOpenAchievements={() => setIsAchievementsModalOpen(true)}
              onEditProfile={() => navigate('/profile')}
              onLaunchChallenge={handleLaunchLogicDuel}
            />

            {/* Daily Quests Card with Live Arena Shortcuts */}
            <div id="daily-quests" className="h-full">
              <DailyQuestsCard
                quests={quests}
                streak={unifiedProfile.streakDays || player.current_streak}
                onSelectQuest={(q) => setActiveQuest(q)}
                onLaunchCodeArena={handleLaunchCodeArena}
                onLaunchLogicDuel={handleLaunchLogicDuel}
              />
            </div>

            {/* Skill Tree Preview Card */}
            <div className="h-full">
              <SkillTreePreviewCard
                skills={treeSkills}
                onOpenFullTree={() => setIsSkillTreeModalOpen(true)}
              />
            </div>
          </div>

          {/* Boss Battle Card (Cyber Dragon, 10,000 HP, Fast-Track Pipeline) */}
          <div id="boss-battles">
            <BossBattleCard
              battle={primaryBossBattle}
              onOpenWorkspace={() => setIsBossArenaOpen(true)}
            />
          </div>
        </div>

        {/* Right Rail: Leaderboard, Guild, Upcoming Events */}
        <aside className="w-80 flex-shrink-0 hidden lg:flex flex-col gap-6" id="leaderboard-section">
          {/* Leaderboard Widget */}
          <LeaderboardWidget
            players={leaderboard}
            currentTab={leaderboardTab}
            onTabChange={handleLeaderboardTabChange}
            onViewFull={() => handleLeaderboardTabChange('overall')}
          />

          {/* Campus Guild Widget */}
          <GuildWidget
            guild={guild}
            onOpenGuildHub={() => navigate('/network')}
          />

          {/* Upcoming Events Widget */}
          <EventsWidget
            events={events}
            onOpenEventsModal={() => {
              if (quests.length > 0) setActiveQuest(quests[0]);
            }}
          />
        </aside>
      </main>

      {/* Interactive Gameplay Arena Modals */}
      {activeCodeQuest && (
        <PlayableCodeArena
          quest={activeCodeQuest}
          userId={player.id}
          onClose={() => setActiveCodeQuest(null)}
          onSuccess={async (xp) => {
            await loadPlayerData();
            setActiveCodeQuest(null);
          }}
        />
      )}

      {activeLogicQuest && (
        <PlayableLogicGame
          quest={activeLogicQuest}
          userId={player.id}
          onClose={() => setActiveLogicQuest(null)}
          onSuccess={async (xp) => {
            await loadPlayerData();
            setActiveLogicQuest(null);
          }}
        />
      )}

      {isBossArenaOpen && (
        <PlayableBossBattleArena
          battle={primaryBossBattle}
          userId={player.id}
          onClose={() => setIsBossArenaOpen(false)}
          onVictory={async () => {
            await loadPlayerData();
            setIsBossArenaOpen(false);
          }}
        />
      )}

      {/* 2.5D Career World Map Modal */}
      {isWorldMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-[#071329] border border-[#7047F5]/40 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#36D9F5]" />
                <h2 className="text-xl font-black text-white">Career Realms World Map</h2>
              </div>
              <button
                onClick={() => setIsWorldMapOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CareerWorldMap
              currentPath={unifiedProfile.careerPath}
              playerLevel={unifiedProfile.level}
              onSelectRealm={(realm) => {
                setIsWorldMapOpen(false);
                handleLaunchCodeArena();
              }}
              onEnterWorldPortal={() => {
                setIsWorldMapOpen(false);
                setIsBossArenaOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* General Purpose Modals */}
      <QuestWorkspaceModal
        quest={activeQuest}
        userId={player.id}
        onClose={() => setActiveQuest(null)}
        onQuestClaimed={async () => {
          await loadPlayerData();
          const updatedQuests = await CareerQuestService.getQuests(player.id);
          setQuests(updatedQuests);
        }}
      />

      <FullSkillTreeModal
        isOpen={isSkillTreeModalOpen}
        userId={player.id}
        onClose={() => setIsSkillTreeModalOpen(false)}
        onSkillMastered={async () => {
          await loadPlayerData();
        }}
      />

      <RewardsStoreModal
        isOpen={isRewardsModalOpen}
        userId={player.id}
        coins={player.career_coins}
        onClose={() => setIsRewardsModalOpen(false)}
        onCoinsUpdated={async () => {
          await loadPlayerData();
        }}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        userId={player.id}
        onClose={() => setIsAchievementsModalOpen(false)}
      />

      <AICareerCompanionModal
        isOpen={isAICoachOpen}
        player={player}
        onClose={() => setIsAICoachOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileCareerVerseNav
        onOpenQuests={() => {
          const el = document.getElementById('daily-quests');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenProfile={() => navigate(isGuest ? '/auth' : '/passport')}
      />
    </div>
  );
};

export default CareerVersePage;
