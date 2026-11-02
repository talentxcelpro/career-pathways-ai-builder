import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CareerVerseHeader } from '@/components/careerverse/CareerVerseHeader';
import { CareerVerseSidebar, CareerVerseNavSection } from '@/components/careerverse/CareerVerseSidebar';
import { HeroBanner } from '@/components/careerverse/HeroBanner';
import { PlayerProfileCard } from '@/components/careerverse/PlayerProfileCard';
import { DailyQuestsCard } from '@/components/careerverse/DailyQuestsCard';
import { SkillTreePreviewCard } from '@/components/careerverse/SkillTreePreviewCard';
import { BossBattleCard } from '@/components/careerverse/BossBattleCard';
import { LeaderboardWidget } from '@/components/careerverse/LeaderboardWidget';
import { GuildWidget } from '@/components/careerverse/GuildWidget';
import { EventsWidget } from '@/components/careerverse/EventsWidget';
import { MobileCareerVerseNav } from '@/components/careerverse/MobileCareerVerseNav';

// Modals & Sub-views
import { QuestWorkspaceModal } from '@/components/careerverse/QuestWorkspaceModal';
import { FullSkillTreeModal } from '@/components/careerverse/FullSkillTreeModal';
import { BossBattleWorkspaceModal } from '@/components/careerverse/BossBattleWorkspaceModal';
import { RewardsStoreModal } from '@/components/careerverse/RewardsStoreModal';
import { AchievementsModal } from '@/components/careerverse/AchievementsModal';
import { AICareerCompanionModal } from '@/components/careerverse/AICareerCompanionModal';
import { RecruiterBossBattleDashboard } from '@/components/careerverse/RecruiterBossBattleDashboard';
import { CareerVerseAdminDashboard } from '@/components/careerverse/CareerVerseAdminDashboard';

// Services
import { careerPlayerService, CareerPlayer } from '@/services/careerverse/careerPlayerService';
import { careerQuestService, CareerQuest } from '@/services/careerverse/careerQuestService';
import { careerSkillTreeService, CareerSkillNode } from '@/services/careerverse/careerSkillTreeService';
import { careerBossBattleService, CareerBossBattle } from '@/services/careerverse/careerBossBattleService';
import { careerLeaderboardService, LeaderboardEntry } from '@/services/careerverse/careerLeaderboardService';
import { careerGuildService } from '@/services/careerverse/careerLeaderboardService';
import { careerEventsService, careerBadgeService, careerRewardsService } from '@/services/careerverse/careerBadgeAndRewardsService';
import { toast } from 'sonner';

export const CareerVersePage: React.FC = () => {
  const { user } = useOptimizedAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userId = user?.id || 'demo_user_id';

  // Section navigation state
  const [activeSection, setActiveSection] = useState<CareerVerseNavSection>('home');
  const [leaderboardScope, setLeaderboardScope] = useState<'college' | 'react' | 'overall'>('college');

  // Modal states
  const [selectedQuest, setSelectedQuest] = useState<CareerQuest | null>(null);
  const [isSkillTreeModalOpen, setIsSkillTreeModalOpen] = useState(false);
  const [selectedSkillNode, setSelectedSkillNode] = useState<CareerSkillNode | null>(null);
  const [selectedBossBattle, setSelectedBossBattle] = useState<CareerBossBattle | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isAICompanionOpen, setIsAICompanionOpen] = useState(false);
  const [isRecruiterView, setIsRecruiterView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // 1. Fetch Current Player
  const { data: player } = useQuery<CareerPlayer | null>({
    queryKey: ['career_player', userId],
    queryFn: () => careerPlayerService.getOrCreateCurrentPlayer(userId),
    staleTime: 60 * 1000
  });

  // 2. Fetch Daily Quests
  const { data: quests = [] } = useQuery<CareerQuest[]>({
    queryKey: ['career_quests', userId],
    queryFn: () => careerQuestService.getUserQuestsWithStatus(userId),
    staleTime: 60 * 1000
  });

  // 3. Fetch Skill Tree Nodes
  const { data: skillNodes = [] } = useQuery<CareerSkillNode[]>({
    queryKey: ['career_skills', userId],
    queryFn: () => careerSkillTreeService.getTreeNodes('technology', userId),
    staleTime: 60 * 1000
  });

  // 4. Fetch Boss Battles
  const { data: bossBattles = [] } = useQuery<CareerBossBattle[]>({
    queryKey: ['career_boss_battles', userId],
    queryFn: () => careerBossBattleService.getBossBattles(userId),
    staleTime: 60 * 1000
  });

  // 5. Fetch Leaderboard
  const { data: leaderboardEntries = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['career_leaderboard', leaderboardScope, userId],
    queryFn: () => careerLeaderboardService.getLeaderboard(leaderboardScope, userId),
    staleTime: 60 * 1000
  });

  // 6. Fetch Guilds
  const { data: guilds = [] } = useQuery({
    queryKey: ['career_guilds', userId],
    queryFn: () => careerGuildService.getGuilds(userId),
    staleTime: 60 * 1000
  });

  // 7. Fetch Events
  const { data: events = [] } = useQuery({
    queryKey: ['career_events', userId],
    queryFn: () => careerEventsService.getEvents(userId),
    staleTime: 60 * 1000
  });

  // 8. Fetch Badges
  const { data: badges = [] } = useQuery({
    queryKey: ['career_badges', userId],
    queryFn: () => careerBadgeService.getBadgesWithUserEarned(userId),
    staleTime: 60 * 1000
  });

  // Callback to invalidate player and quest data on actions
  const handleRefreshProgress = () => {
    queryClient.invalidateQueries({ queryKey: ['career_player'] });
    queryClient.invalidateQueries({ queryKey: ['career_quests'] });
    queryClient.invalidateQueries({ queryKey: ['career_leaderboard'] });
  };

  const handleSelectSection = (section: CareerVerseNavSection) => {
    setActiveSection(section);
    if (section === 'passport') {
      navigate('/passport');
    } else if (section === 'quests') {
      if (quests.length > 0) setSelectedQuest(quests[0]);
    } else if (section === 'skills') {
      setIsSkillTreeModalOpen(true);
    } else if (section === 'boss-battles') {
      if (bossBattles.length > 0) setSelectedBossBattle(bossBattles[0]);
    } else if (section === 'rewards') {
      setIsRewardsModalOpen(true);
    } else if (section === 'leaderboards') {
      toast.info('Viewing full campus & overall leaderboards.');
    } else if (section === 'guilds') {
      toast.info('Guild Hub active. You are enrolled in TechTitans - ABC College.');
    }
  };

  return (
    <div className="careerverse-theme min-h-screen flex flex-col antialiased selection:bg-[#7047F5] selection:text-white pb-20 lg:pb-8">
      <Helmet>
        <title>Career RPG | TalentXcel CareerVerse</title>
        <meta name="description" content="Your Career Is The Game. Your Skills Are Your Power. Your Job Is The Victory. Production Career RPG by TalentXcel." />
      </Helmet>

      {/* Top Header */}
      <CareerVerseHeader
        player={player || null}
        onOpenNotifications={() => toast.info('No new unread mission alerts.')}
        onOpenAICompanion={() => setIsAICompanionOpen(true)}
      />

      {/* Main Responsive Grid Layout (Desktop: Sidebar + 3 Columns | Tablet: 2 Col | Mobile: 1 Col) */}
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 pt-4 flex-1 flex gap-6">
        
        {/* Left Fixed Sidebar (Desktop only) */}
        <div className="hidden lg:block shrink-0">
          <CareerVerseSidebar
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onOpenPremium={() => setIsRewardsModalOpen(true)}
          />
        </div>

        {/* Center Main Dashboard Content */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Top Switcher for Recruiter / Admin Mode */}
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">View Mode:</span>
              <button
                onClick={() => { setIsRecruiterView(false); setIsAdminView(false); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !isRecruiterView && !isAdminView
                    ? 'bg-[#7047F5] text-white shadow-[0_0_12px_rgba(112,71,245,0.4)]'
                    : 'bg-[#101E3B] text-slate-300 hover:text-white'
                }`}
              >
                Player RPG
              </button>
              <button
                onClick={() => { setIsRecruiterView(true); setIsAdminView(false); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isRecruiterView
                    ? 'bg-[#278DFF] text-white shadow-[0_0_12px_rgba(39,141,255,0.4)]'
                    : 'bg-[#101E3B] text-slate-300 hover:text-white'
                }`}
              >
                Recruiter Mode
              </button>
              <button
                onClick={() => { setIsAdminView(true); setIsRecruiterView(false); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isAdminView
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(54,217,245,0.4)]'
                    : 'bg-[#101E3B] text-slate-300 hover:text-white'
                }`}
              >
                Admin Control
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#20D994] animate-pulse" />
              <span>Realtime Connected</span>
            </div>
          </div>

          {/* Conditional Views: Recruiter vs Admin vs Standard RPG Dashboard */}
          {isRecruiterView ? (
            <RecruiterBossBattleDashboard onClose={() => setIsRecruiterView(false)} />
          ) : isAdminView ? (
            <CareerVerseAdminDashboard />
          ) : (
            <>
              {/* Hero Stargate Banner */}
              <HeroBanner
                onSelectPortal={(portal) => {
                  if (portal === 'learn') navigate('/learning');
                  else if (portal === 'practice') setIsSkillTreeModalOpen(true);
                  else if (portal === 'compete') setSelectedBossBattle(bossBattles[0] || null);
                  else if (portal === 'get-hired') navigate('/jobs');
                }}
              />

              {/* 3-Column Core Environment Grid matching reference screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Player Identity Card (Span 3 on Desktop) */}
                <div className="md:col-span-12 lg:col-span-3">
                  <PlayerProfileCard
                    player={player || null}
                    onEditProfile={() => toast.info('Edit player profile modal or change title.')}
                    onOpenPassport={() => navigate('/passport')}
                    onViewAchievements={() => setIsAchievementsModalOpen(true)}
                  />
                </div>

                {/* Center Column: Daily Quests + Skill Tree + Boss Battle (Span 6 on Desktop) */}
                <div className="md:col-span-12 lg:col-span-6 space-y-6">
                  
                  {/* Daily Quests Card & Streak */}
                  <DailyQuestsCard
                    quests={quests}
                    streakCount={player?.streak_count || 7}
                    onOpenQuest={(q) => setSelectedQuest(q)}
                    onQuickComplete={async (q) => {
                      const res = await careerQuestService.completeQuest(userId, q.id);
                      if (res.success) {
                        toast.success(`Completed! +${res.xp_awarded} XP`);
                        handleRefreshProgress();
                      }
                    }}
                  />

                  {/* Skill Tree Technology Preview */}
                  <SkillTreePreviewCard
                    skills={skillNodes}
                    onOpenFullTree={() => setIsSkillTreeModalOpen(true)}
                    onSelectNode={(node) => {
                      setSelectedSkillNode(node);
                      setIsSkillTreeModalOpen(true);
                    }}
                  />

                  {/* Boss Battle Employer Challenge */}
                  <BossBattleCard
                    battle={bossBattles[0] || null}
                    onAcceptBattle={(battle) => setSelectedBossBattle(battle)}
                  />

                </div>

                {/* Right Column: Leaderboard + Guild + Upcoming Events (Span 3 on Desktop) */}
                <div className="md:col-span-12 lg:col-span-3 space-y-6">
                  
                  {/* Leaderboard Widget */}
                  <LeaderboardWidget
                    entries={leaderboardEntries}
                    currentScope={leaderboardScope}
                    onChangeScope={(scope) => setLeaderboardScope(scope)}
                    onOpenFullLeaderboard={() => toast.info('Displaying full rankings.')}
                  />

                  {/* Guild Widget */}
                  <GuildWidget
                    guild={guilds[0] || null}
                    onOpenGuildHub={() => toast.info('TechTitans Guild Hub: Rank #3 with 42 active members.')}
                  />

                  {/* Upcoming Events Widget */}
                  <EventsWidget
                    events={events}
                    onOpenEvents={() => toast.info('Discover all campus and employer hackathons.')}
                    onSelectEvent={(e) => toast.success(`Registered for ${e.title} (${e.date_display})!`)}
                  />

                </div>

              </div>
            </>
          )}

        </main>

      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileCareerVerseNav
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* MODALS */}
      {selectedQuest && (
        <QuestWorkspaceModal
          quest={selectedQuest}
          userId={userId}
          onClose={() => setSelectedQuest(null)}
          onQuestCompleted={() => handleRefreshProgress()}
        />
      )}

      {isSkillTreeModalOpen && (
        <FullSkillTreeModal
          skills={skillNodes}
          userId={userId}
          onClose={() => setIsSkillTreeModalOpen(false)}
          onSkillUpdated={() => handleRefreshProgress()}
        />
      )}

      {selectedBossBattle && (
        <BossBattleWorkspaceModal
          battle={selectedBossBattle}
          userId={userId}
          onClose={() => setSelectedBossBattle(null)}
          onBattleStageAdvanced={() => handleRefreshProgress()}
        />
      )}

      {isRewardsModalOpen && (
        <RewardsStoreModal
          userCoins={player?.career_coins || 350}
          userId={userId}
          onClose={() => setIsRewardsModalOpen(false)}
          onRewardRedeemed={() => handleRefreshProgress()}
        />
      )}

      {isAchievementsModalOpen && (
        <AchievementsModal
          badges={badges}
          onClose={() => setIsAchievementsModalOpen(false)}
        />
      )}

      {isAICompanionOpen && (
        <AICareerCompanionModal
          player={player || null}
          onClose={() => setIsAICompanionOpen(false)}
          onSelectQuestRecommendation={(qName) => {
            setIsAICompanionOpen(false);
            if (quests.length > 0) setSelectedQuest(quests[0]);
          }}
        />
      )}

    </div>
  );
};

export default CareerVersePage;
