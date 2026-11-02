import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/careerverse.css';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
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
import { Loader2, Sparkles, LogIn, UserPlus, X, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CareerVersePage: React.FC = () => {
  const { user: contextUser, loading: contextAuthLoading } = useOptimizedAuth();
  const navigate = useNavigate();

  // Active Authenticated Session & In-flight States
  const [activeUser, setActiveUser] = useState<User | null>(contextUser ?? null);
  const [authResolved, setAuthResolved] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Primary Game State
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

  const isGuest = !activeUser;

  // Requirement 1 & 2: Resolve active Supabase session on page load & subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    // 1. Resolve active session on page load
    const resolveAuthSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          const resolvedUser = session?.user ?? contextUser ?? null;
          setActiveUser(resolvedUser);
          setAuthResolved(true);
        }
      } catch (err) {
        console.warn('Error resolving initial Supabase auth session:', err);
        if (isMounted) {
          setActiveUser(contextUser ?? null);
          setAuthResolved(true);
        }
      }
    };

    resolveAuthSession();

    // 2. Subscribe to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      console.log('[CareerVerse Auth Event]:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Requirement 9: Immediately transition from guest mode to real player profile
          setActiveUser(session.user);
          setFetchError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        // Requirement 10: Ensure logout immediately removes authenticated private data from interface
        setActiveUser(null);
        setPlayer(GUEST_PLAYER);
        setUnifiedProfile(careerIntelligenceEngine.getGuestProfile());
        setGuild(null);
        setFetchError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [contextUser]);

  // Requirement 3, 4, 5, 8, 11: Join Career Passport, profiles, skills, education, experience and calculate real progress
  const loadCareerData = useCallback(async (userToLoad: User | null) => {
    try {
      setPageLoading(true);
      setFetchError(null);

      if (!userToLoad) {
        // Requirement 7: Honest guest preview
        const guestProf = careerIntelligenceEngine.getGuestProfile();
        setUnifiedProfile(guestProf);
        setPlayer(GUEST_PLAYER);

        const [qData, sData, bData, eData, lb] = await Promise.all([
          CareerQuestService.getQuests('guest'),
          CareerSkillTreeService.getSkillsForPath('technology', 'guest'),
          CareerBossBattleService.getLiveBattles('guest'),
          CareerBadgeAndRewardsService.getEvents('guest'),
          CareerLeaderboardService.getLeaderboard(leaderboardTab, 'guest', undefined)
        ]);

        const pQuests = await careerQuestEngine.getPersonalizedQuests(guestProf);
        setQuests(qData);
        setTreeSkills(sData);
        setBossBattles(bData);
        setEvents(eData);
        setLeaderboard(lb);
        setPlayableQuests(pQuests);
        setGuild(null);
        return;
      }

      // Authenticated User: Retrieve actual profile using auth.uid()
      const uid = userToLoad.id;

      // Join candidate profile, skills, education, experience, assessments, and passport records
      const profData = await careerIntelligenceEngine.evaluateUserProfile(uid);
      setUnifiedProfile(profData);

      // Get or activate authenticated player record
      const pData = await CareerPlayerService.getOrActivatePlayer(
        uid,
        userToLoad.user_metadata?.full_name || userToLoad.email?.split('@')[0]
      );
      setPlayer(pData);

      // Concurrently query related real database systems
      const [qData, sData, bData, gData, eData, lb] = await Promise.all([
        CareerQuestService.getQuests(uid),
        CareerSkillTreeService.getSkillsForPath(profData.careerPath || 'technology', uid),
        CareerBossBattleService.getLiveBattles(uid),
        CareerLeaderboardService.getCampusGuild(pData.guild_id),
        CareerBadgeAndRewardsService.getEvents(uid),
        CareerLeaderboardService.getLeaderboard(leaderboardTab, uid, pData.college)
      ]);

      setQuests(qData);
      setTreeSkills(sData);
      setBossBattles(bData);
      setGuild(gData);
      setEvents(eData);
      setLeaderboard(lb);

      const pQuests = await careerQuestEngine.getPersonalizedQuests(profData);
      setPlayableQuests(pQuests);
    } catch (err: any) {
      console.error('Error loading authentic CareerVerse player data:', err);
      // Requirement 8: If profile retrieval fails, show loading/error state and retry option. Never silently substitute demo data!
      setFetchError(err?.message || 'Failed to retrieve authentic player profile from Supabase.');
    } finally {
      setPageLoading(false);
    }
  }, [leaderboardTab]);

  // Initial and reactive load whenever auth status resolves or active user changes
  useEffect(() => {
    if (authResolved) {
      loadCareerData(activeUser);
    }
  }, [authResolved, activeUser, loadCareerData]);

  // Refresh single player & intelligence profile state after quest/battle completion
  const loadPlayerData = useCallback(async () => {
    if (!activeUser?.id) return;
    try {
      const pProfile = await careerIntelligenceEngine.evaluateUserProfile(activeUser.id);
      setUnifiedProfile(pProfile);

      const pQuests = await careerQuestEngine.getPersonalizedQuests(pProfile);
      setPlayableQuests(pQuests);

      const p = await CareerPlayerService.getOrActivatePlayer(
        activeUser.id,
        activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0]
      );
      setPlayer(p);
    } catch (err) {
      console.warn('Failed to refresh authentic profile:', err);
    }
  }, [activeUser]);

  // Realtime subscription for authenticated user
  useEffect(() => {
    if (!activeUser?.id) return;

    const channel = CareerRealtimeService.subscribeToPlayerUpdates(activeUser.id, (updated) => {
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
  }, [activeUser]);

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

  // Requirement 8: Explicit loading state
  if (!authResolved || pageLoading) {
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

  // Requirement 8: Explicit error state with retry option. Never silently substitute demo data!
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#071329] flex flex-col items-center justify-center gap-5 text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="font-black text-xl text-white">Profile Synchronization Failed</h3>
          <p className="text-sm text-slate-400 mt-2">
            {fetchError}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            TalentXcel CareerVerse requires authentic player profile records and will never silently substitute demo data.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button
            onClick={() => loadCareerData(activeUser)}
            className="bg-[#278DFF] hover:bg-[#1a7ae0] text-white font-bold px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-xl"
          >
            Go to Home
          </Button>
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
